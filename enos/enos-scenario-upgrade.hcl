// Copyright (c) HashiCorp, Inc.
// SPDX-License-Identifier: BUSL-1.1

scenario "upgrade" {
  description = <<-EOF
    The upgrade scenario verifies in-place upgrades between previously released versions of Vault
    against another candidate build. The build can be a local branch, any CRT built Vault artifact
    saved to the local machine, or any CRT built Vault artifact in the stable channel in Artifactory.

    The scenario creates a new Vault cluster with a previously released version of Vault. It then
    mounts engines, creates data, and performs an in-place upgrade with any candidate built. Finally,
    it performs quality verification.

    # How to run this scenario

    For general instructions on running a scenario, refer to the Enos docs: https://eng-handbook.hashicorp.services/internal-tools/enos/running-a-scenario/
    For troubleshooting tips and common errors, see https://eng-handbook.hashicorp.services/internal-tools/enos/troubleshooting/.

    Variables required for all scenario variants:
      - aws_ssh_private_key_path (more info about AWS SSH keypairs: https://eng-handbook.hashicorp.services/internal-tools/enos/getting-started/#set-your-aws-key-pair-name-and-private-key)
      - aws_ssh_keypair_name
      - vault_build_date*
      - vault_product_version
      - vault_revision*

    * If you don't already know what build date and revision you should be using, see
    https://eng-handbook.hashicorp.services/internal-tools/enos/troubleshooting/#execution-error-expected-vs-got-for-vault-versioneditionrevisionbuild-date.

    Variables required for some scenario variants:
      - artifactory_token (if using `artifact_source:artifactory` in your filter)
      - aws_region (if different from the default value in enos-variables.hcl)
      - consul_license_path (if using an ENT edition of Consul)
      - distro_version_<distro> (if different from the default version for your target
      distro. See supported distros and default versions in the distro_version_<distro>
      definitions in enos-variables.hcl)
      - vault_artifact_path (the path to where you have a Vault artifact already downloaded,
      if using `artifact_source:crt` in your filter)
      - vault_license_path (if using an ENT edition of Vault)
      - vault_upgrade_initial_version (if the version you want to start with differs
      from the default value defined in enos-variables.hcl)
  EOF

  matrix {
    arch            = global.archs
    artifact_source = global.artifact_sources
    artifact_type   = global.artifact_types
    backend         = global.backends
    config_mode     = global.config_modes
    consul_edition  = global.consul_editions
    consul_version  = global.consul_versions
    distro          = global.distros
    edition         = global.editions
    ip_version      = global.ip_versions
    seal            = global.seals

    // Our local builder always creates bundles
    exclude {
      artifact_source = ["local"]
      artifact_type   = ["package"]
    }

    // There are no published versions of these artifacts yet. We'll update this to exclude older
    // versions after our initial publication of these editions for arm64.
    exclude {
      arch    = ["arm64"]
      edition = ["ent.fips1403", "ent.hsm", "ent.hsm.fips1403"]
    }

    // PKCS#11 can only be used with hsm editions
    exclude {
      seal    = ["pkcs11"]
      edition = [for e in matrix.edition : e if !strcontains(e, "hsm")]
    }

    // softhsm packages not available for leap/sles.
    exclude {
      seal   = ["pkcs11"]
      distro = ["leap", "sles"]
    }

    // Testing in IPV6 mode is currently implemented for integrated Raft storage only
    exclude {
      ip_version = ["6"]
      backend    = ["consul"]
    }
  }

  terraform_cli = terraform_cli.default
  terraform     = terraform.default
  providers = [
    provider.aws.default,
    provider.enos.ec2_user,
    provider.enos.ubuntu
  ]

  locals {
    artifact_path = matrix.artifact_source != "artifactory" ? abspath(var.vault_artifact_path) : null
    enos_provider = {
      amzn   = provider.enos.ec2_user
      leap   = provider.enos.ec2_user
      rhel   = provider.enos.ec2_user
      sles   = provider.enos.ec2_user
      ubuntu = provider.enos.ubuntu
    }
    manage_service = matrix.artifact_type == "bundle"
  }

  step "build_vault" {
    description = global.description.build_vault
    module      = "build_${matrix.artifact_source}"

    variables {
      build_tags        = var.vault_local_build_tags != null ? var.vault_local_build_tags : global.build_tags[matrix.edition]
      artifact_path     = local.artifact_path
      goarch            = matrix.arch
      goos              = "linux"
      artifactory_host  = matrix.artifact_source == "artifactory" ? var.artifactory_host : null
      artifactory_repo  = matrix.artifact_source == "artifactory" ? var.artifactory_repo : null
      artifactory_token = matrix.artifact_source == "artifactory" ? var.artifactory_token : null
      arch              = matrix.artifact_source == "artifactory" ? matrix.arch : null
      product_version   = var.vault_product_version
      artifact_type     = matrix.artifact_type
      distro            = matrix.artifact_source == "artifactory" ? matrix.distro : null
      edition           = matrix.artifact_source == "artifactory" ? matrix.edition : null
      revision          = var.vault_revision
    }
  }

  step "ec2_info" {
    description = global.description.ec2_info
    module      = module.ec2_info
  }

  step "create_vpc" {
    description = global.description.create_vpc
    module      = module.create_vpc

    variables {
      common_tags = global.tags
      ip_version  = matrix.ip_version
    }
  }

  // This step reads the contents of the backend license if we're using a Consul backend and
  // an "ent" Consul edition.
  step "read_backend_license" {
    description = global.description.read_backend_license
    skip_step   = matrix.backend == "raft" || matrix.consul_edition == "ce"
    module      = module.read_license

    variables {
      file_name = global.backend_license_path
    }
  }

  step "read_vault_license" {
    description = global.description.read_vault_license
    skip_step   = matrix.edition == "ce"
    module      = module.read_license

    variables {
      file_name = global.vault_license_path
    }
  }

  step "create_seal_key" {
    description = global.description.create_seal_key
    module      = "seal_${matrix.seal}"
    depends_on  = [step.create_vpc]

    providers = {
      enos = provider.enos.ubuntu
    }

    variables {
      cluster_id  = step.create_vpc.id
      common_tags = global.tags
    }
  }

  step "create_external_integration_target" {
    description = global.description.create_external_integration_target
    module      = module.target_ec2_instances
    depends_on  = [step.create_vpc]

    providers = {
      enos = local.enos_provider["ubuntu"]
    }

    variables {
      ami_id          = step.ec2_info.ami_ids["arm64"]["ubuntu"]["24.04"]
      cluster_tag_key = global.vault_tag_key
      common_tags     = global.tags
      vpc_id          = step.create_vpc.id
    }
  }

  step "create_vault_cluster_targets" {
    description = global.description.create_vault_cluster_targets
    module      = module.target_ec2_instances
    depends_on  = [step.create_vpc]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    variables {
      ami_id          = step.ec2_info.ami_ids[matrix.arch][matrix.distro][global.distro_version[matrix.distro]]
      cluster_tag_key = global.vault_tag_key
      common_tags     = global.tags
      seal_key_names  = step.create_seal_key.resource_names
      vpc_id          = step.create_vpc.id
    }
  }

  step "create_vault_cluster_backend_targets" {
    description = global.description.create_vault_cluster_targets
    module      = matrix.backend == "consul" ? module.target_ec2_instances : module.target_ec2_shim
    depends_on  = [step.create_vpc]

    providers = {
      enos = provider.enos.ubuntu
    }

    variables {
      ami_id          = step.ec2_info.ami_ids["arm64"]["ubuntu"][global.distro_version["ubuntu"]]
      cluster_tag_key = global.backend_tag_key
      common_tags     = global.tags
      seal_key_names  = step.create_seal_key.resource_names
      vpc_id          = step.create_vpc.id
    }
  }

  step "set_up_external_integration_target" {
    description = global.description.set_up_external_integration_target
    module      = module.set_up_external_integration_target
    depends_on = [
      step.create_external_integration_target
    ]

    providers = {
      enos = local.enos_provider["ubuntu"]
    }

    variables {
      hosts      = step.create_external_integration_target.hosts
      ip_version = matrix.ip_version
      packages   = concat(global.packages, global.distro_packages["ubuntu"]["24.04"], ["podman", "podman-docker"])
      ports      = global.integration_host_ports
    }
  }

  step "create_backend_cluster" {
    description = global.description.create_backend_cluster
    module      = "backend_${matrix.backend}"
    depends_on = [
      step.create_vault_cluster_backend_targets,
      step.set_up_external_integration_target
    ]

    providers = {
      enos = provider.enos.ubuntu
    }

    verifies = [
      // verified in modules
      quality.consul_autojoin_aws,
      quality.consul_config_file,
      quality.consul_ha_leader_election,
      quality.consul_service_start_server,
      // verified in enos_consul_start resource
      quality.consul_api_agent_host_read,
      quality.consul_api_health_node_read,
      quality.consul_api_operator_raft_config_read,
      quality.consul_cli_validate,
      quality.consul_health_state_passing_read_nodes_minimum,
      quality.consul_operator_raft_configuration_read_voters_minimum,
      quality.consul_service_systemd_notified,
      quality.consul_service_systemd_unit,
    ]

    variables {
      cluster_name    = step.create_vault_cluster_backend_targets.cluster_name
      cluster_tag_key = global.backend_tag_key
      hosts           = step.create_vault_cluster_backend_targets.hosts
      license         = (matrix.backend == "consul" && matrix.consul_edition == "ent") ? step.read_backend_license.license : null
      release = {
        edition = matrix.consul_edition
        version = matrix.consul_version
      }
    }
  }

  step "create_vault_cluster" {
    description = global.description.create_vault_cluster
    module      = module.vault_cluster
    depends_on = [
      step.create_backend_cluster,
      step.build_vault,
      step.create_vault_cluster_targets
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      // verified in modules
      quality.consul_service_start_client,
      quality.vault_artifact_bundle,
      quality.vault_artifact_deb,
      quality.vault_artifact_rpm,
      quality.vault_audit_log,
      quality.vault_audit_socket,
      quality.vault_audit_syslog,
      quality.vault_autojoin_aws,
      quality.vault_storage_backend_consul,
      quality.vault_config_env_variables,
      quality.vault_config_file,
      quality.vault_config_log_level,
      quality.vault_init,
      quality.vault_license_required_ent,
      quality.vault_listener_ipv4,
      quality.vault_listener_ipv6,
      quality.vault_service_start,
      quality.vault_storage_backend_raft,
      // verified in enos_vault_start resource
      quality.vault_api_sys_config_read,
      quality.vault_api_sys_ha_status_read,
      quality.vault_api_sys_health_read,
      quality.vault_api_sys_host_info_read,
      quality.vault_api_sys_replication_status_read,
      quality.vault_api_sys_seal_status_api_read_matches_sys_health,
      quality.vault_api_sys_storage_raft_autopilot_configuration_read,
      quality.vault_api_sys_storage_raft_autopilot_state_read,
      quality.vault_api_sys_storage_raft_configuration_read,
      quality.vault_cli_status_exit_code,
      quality.vault_service_systemd_unit,
      quality.vault_service_systemd_notified,
    ]

    variables {
      backend_cluster_name    = step.create_vault_cluster_backend_targets.cluster_name
      backend_cluster_tag_key = global.backend_tag_key
      cluster_name            = step.create_vault_cluster_targets.cluster_name
      config_mode             = matrix.config_mode
      consul_license          = (matrix.backend == "consul" && matrix.consul_edition == "ent") ? step.read_backend_license.license : null
      consul_release = matrix.backend == "consul" ? {
        edition = matrix.consul_edition
        version = matrix.consul_version
      } : null
      enable_audit_devices = var.vault_enable_audit_devices
      hosts                = step.create_vault_cluster_targets.hosts
      ip_version           = matrix.ip_version
      license              = matrix.edition != "ce" ? step.read_vault_license.license : null
      manage_service       = true # always handle systemd for released bundles
      packages             = concat(global.packages, global.distro_packages[matrix.distro][global.distro_version[matrix.distro]])
      release = {
        edition = strcontains(matrix.edition, "fips1403") ? (
          // Our eventual constraint will need to factor in each release branch that is mixed, e.g.
          // semverconstraint(var.vault_upgrade_initial_version, "<=1.19.4-0,>=1.19.0-0 || <=1.18.10-0,>=1.18.0-0 || <=1.17.17-0,>=1.17.0-0 || <=1.16.21-0")
          // But for now we've only got to consider before and after 1.19.4
          semverconstraint(var.vault_upgrade_initial_version, "<1.19.4-0")
          ? replace(matrix.edition, "fips1403", "fips1402")
          : matrix.edition
        ) : matrix.edition
        version = var.vault_upgrade_initial_version
      }
      seal_attributes = step.create_seal_key.attributes
      seal_type       = matrix.seal
      storage_backend = matrix.backend
    }
  }

  step "get_local_metadata" {
    description = global.description.get_local_metadata
    skip_step   = matrix.artifact_source != "local"
    module      = module.get_local_metadata
  }

  // Wait for our cluster to elect a leader
  step "wait_for_leader" {
    description = global.description.wait_for_cluster_to_have_leader
    module      = module.vault_wait_for_leader
    depends_on  = [step.create_vault_cluster]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_leader_read,
      quality.vault_unseal_ha_leader_election,
    ]

    variables {
      hosts      = step.create_vault_cluster_targets.hosts
      ip_version = matrix.ip_version
      timeout    = 120 // seconds
      vault_addr = step.create_vault_cluster.api_addr_localhost
      // Use the install dir for our initial version, which always comes from a zip bundle
      vault_install_dir = global.vault_install_dir["bundle"]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "get_vault_cluster_ips" {
    description = global.description.get_vault_cluster_ip_addresses
    module      = module.vault_get_cluster_ips
    depends_on  = [step.wait_for_leader]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_ha_status_read,
      quality.vault_api_sys_leader_read,
      quality.vault_cli_operator_members,
    ]

    variables {
      hosts      = step.create_vault_cluster_targets.hosts
      ip_version = matrix.ip_version
      vault_addr = step.create_vault_cluster.api_addr_localhost
      // Use the install dir for our initial version, which always comes from a zip bundle
      vault_install_dir = global.vault_install_dir["bundle"]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "verify_secrets_engines_create" {
    description = global.description.verify_secrets_engines_create
    module      = module.vault_verify_secrets_engines_create
    depends_on = [
      step.create_vault_cluster,
      step.get_vault_cluster_ips
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_auth_userpass_login_write,
      quality.vault_api_auth_userpass_user_write,
      quality.vault_api_identity_entity_write,
      quality.vault_api_identity_entity_alias_write,
      quality.vault_api_identity_group_write,
      quality.vault_api_identity_oidc_config_write,
      quality.vault_api_identity_oidc_introspect_write,
      quality.vault_api_identity_oidc_key_write,
      quality.vault_api_identity_oidc_key_rotate_write,
      quality.vault_api_identity_oidc_role_write,
      quality.vault_api_identity_oidc_token_read,
      quality.vault_api_sys_auth_userpass_user_write,
      quality.vault_api_sys_policy_write,
      quality.vault_mount_auth,
      quality.vault_mount_kv,
      quality.vault_secrets_kmip_write_config,
      quality.vault_secrets_kv_write,
      quality.vault_secrets_ldap_write_config,
    ]

    variables {
      hosts                  = step.create_vault_cluster_targets.hosts
      ip_version             = matrix.ip_version
      integration_host_state = step.set_up_external_integration_target.state
      leader_host            = step.get_vault_cluster_ips.leader_host
      ports                  = global.integration_host_ports
      vault_addr             = step.create_vault_cluster.api_addr_localhost
      vault_edition          = matrix.edition
      // Use the install dir for our initial version, which always comes from a zip bundle
      vault_install_dir = global.vault_install_dir["bundle"]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  // This step upgrades the Vault cluster to the var.vault_product_version
  // by getting a bundle or package of that version from the matrix.artifact_source
  step "upgrade_vault" {
    description = <<-EOF
      Perform an in-place upgrade of the Vault Cluster nodes by first installing a new version
      of Vault on the cluster node machines and restarting the service.
    EOF
    module      = module.vault_upgrade
    depends_on = [
      step.create_vault_cluster,
      step.verify_secrets_engines_create,
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_cluster_upgrade_in_place,
      quality.vault_service_restart,
    ]

    variables {
      hosts                     = step.create_vault_cluster_targets.hosts
      ip_version                = matrix.ip_version
      vault_addr                = step.create_vault_cluster.api_addr_localhost
      vault_artifactory_release = matrix.artifact_source == "artifactory" ? step.build_vault.vault_artifactory_release : null
      vault_install_dir         = global.vault_install_dir[matrix.artifact_type]
      vault_local_artifact_path = local.artifact_path
      vault_root_token          = step.create_vault_cluster.root_token
      vault_seal_type           = matrix.seal
      vault_unseal_keys         = matrix.seal == "shamir" ? step.create_vault_cluster.unseal_keys_hex : null
    }
  }

  // Wait for our upgraded cluster to elect a leader
  step "wait_for_leader_after_upgrade" {
    description = global.description.wait_for_cluster_to_have_leader
    module      = module.vault_wait_for_leader
    depends_on = [
      step.create_vault_cluster,
      step.upgrade_vault,
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_leader_read,
      quality.vault_unseal_ha_leader_election,
    ]

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      ip_version        = matrix.ip_version
      timeout           = 120 // seconds
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "get_leader_ip_for_step_down" {
    description = global.description.get_vault_cluster_ip_addresses
    module      = module.vault_get_cluster_ips
    depends_on  = [step.wait_for_leader_after_upgrade]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_ha_status_read,
      quality.vault_api_sys_leader_read,
      quality.vault_cli_operator_members,
    ]

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      ip_version        = matrix.ip_version
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  // Force a step down to trigger a new leader election
  step "vault_leader_step_down" {
    description = global.description.vault_leader_step_down
    module      = module.vault_step_down
    depends_on  = [step.get_leader_ip_for_step_down]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_step_down_steps_down,
      quality.vault_cli_operator_step_down,
    ]

    variables {
      leader_host       = step.get_leader_ip_for_step_down.leader_host
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  // Wait for our cluster to elect a leader
  step "wait_for_leader_after_stepdown" {
    description = global.description.wait_for_cluster_to_have_leader
    module      = module.vault_wait_for_leader
    depends_on  = [step.vault_leader_step_down]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_leader_read,
      quality.vault_unseal_ha_leader_election,
    ]

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      ip_version        = matrix.ip_version
      timeout           = 120 // seconds
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "get_updated_vault_cluster_ips" {
    description = global.description.get_vault_cluster_ip_addresses
    module      = module.vault_get_cluster_ips
    depends_on = [
      step.wait_for_leader_after_stepdown,
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_ha_status_read,
      quality.vault_api_sys_leader_read,
      quality.vault_cli_operator_members,
    ]

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      ip_version        = matrix.ip_version
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "verify_vault_unsealed" {
    description = global.description.verify_vault_unsealed
    module      = module.vault_wait_for_cluster_unsealed
    depends_on = [
      step.get_updated_vault_cluster_ips,
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_seal_awskms,
      quality.vault_seal_pkcs11,
      quality.vault_seal_shamir,
    ]

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
    }
  }

  step "verify_vault_version" {
    description = global.description.verify_vault_version
    module      = module.vault_verify_version
    depends_on  = [step.verify_vault_unsealed]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_sys_version_history_keys,
      quality.vault_api_sys_version_history_key_info,
      quality.vault_version_build_date,
      quality.vault_version_edition,
      quality.vault_version_release,
    ]

    variables {
      hosts                 = step.create_vault_cluster_targets.hosts
      vault_addr            = step.create_vault_cluster.api_addr_localhost
      vault_edition         = matrix.edition
      vault_install_dir     = global.vault_install_dir[matrix.artifact_type]
      vault_product_version = matrix.artifact_source == "local" ? step.get_local_metadata.version : var.vault_product_version
      vault_revision        = matrix.artifact_source == "local" ? step.get_local_metadata.revision : var.vault_revision
      vault_build_date      = matrix.artifact_source == "local" ? step.get_local_metadata.build_date : var.vault_build_date
      vault_root_token      = step.create_vault_cluster.root_token
    }
  }

  step "verify_secrets_engines_read" {
    description = global.description.verify_secrets_engines_read
    module      = module.vault_verify_secrets_engines_read
    depends_on = [
      step.verify_secrets_engines_create,
      step.verify_vault_unsealed
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_api_auth_userpass_login_write,
      quality.vault_api_identity_entity_read,
      quality.vault_api_identity_oidc_config_read,
      quality.vault_api_identity_oidc_key_read,
      quality.vault_api_identity_oidc_role_read,
      quality.vault_secrets_kv_read
    ]

    variables {
      create_state      = step.verify_secrets_engines_create.state
      hosts             = step.get_updated_vault_cluster_ips.follower_hosts
      ip_version        = matrix.ip_version
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_edition     = matrix.edition
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "verify_log_secrets" {
    // Only verify log secrets if the audit devices are turned on and we've enabled the check (as
    // it requires a radar license). Some older versions have known issues so we'll skip this step
    // in the event that we're upgrading from them, see VAULT-30557 for more information.
    skip_step = !var.vault_enable_audit_devices || !var.verify_log_secrets || semverconstraint(var.vault_upgrade_initial_version, "=1.17.3 || =1.17.4 || =1.16.7 || =1.16.8")

    description = global.description.verify_log_secrets
    module      = module.verify_log_secrets
    depends_on = [
      step.verify_secrets_engines_read,
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_audit_log_secrets,
      quality.vault_journal_secrets,
      quality.vault_radar_index_create,
      quality.vault_radar_scan_file,
    ]

    variables {
      audit_log_file_path = step.create_vault_cluster.audit_device_file_path
      leader_host         = step.get_updated_vault_cluster_ips.leader_host
      vault_addr          = step.create_vault_cluster.api_addr_localhost
      vault_root_token    = step.create_vault_cluster.root_token
    }
  }

  step "verify_raft_auto_join_voter" {
    description = global.description.verify_raft_cluster_all_nodes_are_voters
    skip_step   = matrix.backend != "raft"
    module      = module.vault_verify_raft_auto_join_voter
    depends_on  = [step.verify_vault_unsealed]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = quality.vault_raft_voters

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      ip_version        = matrix.ip_version
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "verify_replication" {
    description = global.description.verify_replication_status
    module      = module.vault_verify_replication
    depends_on  = [step.verify_vault_unsealed]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_replication_ce_disabled,
      quality.vault_replication_ent_dr_available,
      quality.vault_replication_ent_pr_available,
    ]

    variables {
      hosts         = step.create_vault_cluster_targets.hosts
      vault_addr    = step.create_vault_cluster.api_addr_localhost
      vault_edition = matrix.edition
    }
  }

  step "verify_billing_start_date" {
    description = global.description.verify_billing_start_date
    skip_step   = semverconstraint(var.vault_product_version, "<=1.16.6-0 || >=1.17.0-0 <=1.17.2-0")
    module      = module.vault_verify_billing_start_date
    depends_on = [
      step.get_updated_vault_cluster_ips,
      step.verify_vault_unsealed,
      step.verify_secrets_engines_read,
    ]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = [
      quality.vault_billing_start_date,
    ]

    variables {
      hosts             = step.create_vault_cluster_targets.hosts
      vault_addr        = step.create_vault_cluster.api_addr_localhost
      vault_install_dir = global.vault_install_dir[matrix.artifact_type]
      vault_root_token  = step.create_vault_cluster.root_token
    }
  }

  step "verify_ui" {
    description = global.description.verify_ui
    module      = module.vault_verify_ui
    depends_on  = [step.verify_vault_unsealed]

    providers = {
      enos = local.enos_provider[matrix.distro]
    }

    verifies = quality.vault_ui_assets

    variables {
      hosts      = step.create_vault_cluster_targets.hosts
      vault_addr = step.create_vault_cluster.api_addr_localhost
    }
  }

  output "audit_device_file_path" {
    description = "The file path for the file audit device, if enabled"
    value       = step.create_vault_cluster.audit_device_file_path
  }

  output "external_integration_server_ldap" {
    description = "The LDAP test servers info"
    value       = step.set_up_external_integration_target.state.ldap
  }

  output "integration_host_kmip_state" {
    description = "The KMIP test servers info"
    value       = step.set_up_external_integration_target.state.kmip
  }

  output "cluster_name" {
    description = "The Vault cluster name"
    value       = step.create_vault_cluster.cluster_name
  }

  output "hosts" {
    description = "The Vault cluster target hosts"
    value       = step.create_vault_cluster.hosts
  }

  output "private_ips" {
    description = "The Vault cluster private IPs"
    value       = step.create_vault_cluster.private_ips
  }

  output "public_ips" {
    description = "The Vault cluster public IPs"
    value       = step.create_vault_cluster.public_ips
  }

  output "root_token" {
    description = "The Vault cluster root token"
    value       = step.create_vault_cluster.root_token
  }

  output "recovery_key_shares" {
    description = "The Vault cluster recovery key shares"
    value       = step.create_vault_cluster.recovery_key_shares
  }

  output "recovery_keys_b64" {
    description = "The Vault cluster recovery keys b64"
    value       = step.create_vault_cluster.recovery_keys_b64
  }

  output "recovery_keys_hex" {
    description = "The Vault cluster recovery keys hex"
    value       = step.create_vault_cluster.recovery_keys_hex
  }

  output "seal_name" {
    description = "The Vault cluster seal attributes"
    value       = step.create_seal_key.attributes
  }

  output "secrets_engines_state" {
    description = "The state of configured secrets engines"
    sensitive   = true
    value       = step.verify_secrets_engines_create.state
  }

  output "unseal_keys_b64" {
    description = "The Vault cluster unseal keys"
    value       = step.create_vault_cluster.unseal_keys_b64
  }

  output "unseal_keys_hex" {
    description = "The Vault cluster unseal keys hex"
    value       = step.create_vault_cluster.unseal_keys_hex
  }
}
