.. Copyright (C) 2020 Wazuh, Inc.

.. _wazuh_server_packages_ubuntu:

Ubuntu from packages
====================

For Ubuntu 12.04 or greater, installing the Wazuh server components entails the installation of the relevant packages after adding the repositories.

.. note:: All the commands described below need to be executed with root user privileges.

Adding the Wazuh repository
---------------------------

The first step to setting up Wazuh is to add the Wazuh repository to your server. If you want to download the wazuh-manager package directly, or check the compatible versions, click :ref:`here <packages>`.

1. To perform this procedure, the ``curl``, ``apt-transport-https`` and ``lsb-release`` packages must be installed on your system. If they are not already present, install them using the commands below:

  .. code-block:: console

    # apt-get update
    # apt-get install curl apt-transport-https lsb-release gnupg2

2. Install the GPG key:

  .. code-block:: console

    # curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -

3. Add the repository:

  .. code-block:: console

    # echo "deb https://packages.wazuh.com/3.x/apt/ stable main" | tee -a /etc/apt/sources.list.d/wazuh.list

4. Update the package information:

  .. code-block:: console

    # apt-get update

Installing the Wazuh manager
----------------------------

On your terminal, install the Wazuh manager:

  .. code-block:: console

    # apt-get install wazuh-manager

Once the process is completed, you can check the service status with:

  * For Systemd:

    .. code-block:: console

      # systemctl status wazuh-manager

  * For SysV Init:

    .. code-block:: console

      # service wazuh-manager status

.. versionadded:: 4.0.0

The Wazuh API will be installed along the Wazuh manager by default. No extra steps or requirements are needed to install it

.. note::
    Check out the section :ref:`Wazuh API <api>` for more information on how to set up and use Wazuh API.

**Optional:** Disable the Wazuh repository.

  It is recommended to disable the Wazuh repository in order to prevent accidental upgrades. To do this, use the following command:

  .. code-block:: console

    # sed -i "s/^deb/#deb/" /etc/apt/sources.list.d/wazuh.list
    # apt-get update

  Alternately, you can set the package state to ``hold``, which will stop updates (although you can still upgrade it manually using ``apt-get install``).

  .. code-block:: console

    # echo "wazuh-manager hold" | sudo dpkg --set-selections

.. _wazuh_server_packages_ubuntu_filebeat:

Installing Filebeat
-------------------

Filebeat is the tool on the Wazuh server that securely forwards alerts and archived events to Elasticsearch. To install it:

1. Add the Elastic repository and its GPG key:

  .. code-block:: console

    # apt-get install curl apt-transport-https
    # curl -s https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
    # echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-7.x.list
    # apt-get update

2. Install Filebeat:

  .. code-block:: console

    # apt-get install filebeat=|ELASTICSEARCH_LATEST|

3. Download the Filebeat config file from the Wazuh repository. This is pre-configured to forward Wazuh alerts to Elasticsearch:

  .. code-block:: console

    # curl -so /etc/filebeat/filebeat.yml https://raw.githubusercontent.com/wazuh/wazuh/v|WAZUH_LATEST|/extensions/filebeat/7.x/filebeat.yml

4. Download the alerts template for Elasticsearch:

  .. code-block:: console

    # curl -so /etc/filebeat/wazuh-template.json https://raw.githubusercontent.com/wazuh/wazuh/v|WAZUH_LATEST|/extensions/elasticsearch/7.x/wazuh-template.json

5. Download the Wazuh module for Filebeat:

  .. code-block:: console

    # curl -s https://packages.wazuh.com/3.x/filebeat/wazuh-filebeat-0.1.tar.gz | sudo tar -xvz -C /usr/share/filebeat/module

6. Edit the file ``/etc/filebeat/filebeat.yml`` and replace ``YOUR_ELASTIC_SERVER_IP`` with the IP address or the hostname of the Elasticsearch server. For example:

  .. code-block:: yaml

    output.elasticsearch.hosts: ['http://YOUR_ELASTIC_SERVER_IP:9200']

7. Enable and start the Filebeat service:

  * For Systemd:

    .. code-block:: console

      # systemctl daemon-reload
      # systemctl enable filebeat.service
      # systemctl start filebeat.service

  * For SysV Init:

    .. code-block:: console

      # update-rc.d filebeat defaults 95 10
      # service filebeat start

Next steps
----------

Once you have installed the manager, API and Filebeat, you are ready to install :ref:`Elastic Stack <installation_elastic>`.

Uninstall
---------

To uninstall the Wazuh manager and Wazuh API:

    .. code-block:: console

      # apt-get remove wazuh-manager wazuh-manager

There are files marked as configuration files. Due to this designation, the package manager doesn't remove those files from the filesystem. The complete files removal action can be done using the following command:

    .. code-block:: console

      # apt-get remove --purge wazuh-manager wazuh-manager

To uninstall filebeat:

    .. code-block:: console

      # apt-get remove filebeat

The Filebeat complete files removal action can be done using the following command:

    .. code-block:: console

      # apt-get remove --purge filebeat

