'use strict';

/**
 * @ngdoc function
 * @name nethserverCockpitHotsyncApp.controller:HotsyncCtrl
 * @description
 * # HotsyncCtrl
 * Controller of the nethserverCockpitHotsyncApp
 */

angular.module('nethserverCockpitHotsyncApp', [])
  .controller('HotsyncCtrl', ['$scope', function($scope) {

    var _ = cockpit.gettext;

    $scope.hsyncSettings = {
      'host': '',
      'password': '',
      'role': '',
      'sqlSync': '',
      'status': ''
    }
    $scope.hsyncProps = {}
    $scope.rsyncdProps = {}

    $scope.hsyncConfigured = false;
    $scope.roleSaved = '';

    $scope.db = nethserver.getDatabase('configuration');

    $scope.getProps = function() {
      return $scope.db.open().then(function() {
        $scope.hsyncProps = $scope.db.getProps('hotsync');
        $scope.rsyncdProps = $scope.db.getProps('rsyncd');
        $scope.hsyncSettings.status = $scope.hsyncProps.status;
        $scope.hsyncSettings.role = $scope.hsyncProps.role;
        $scope.hsyncSettings.password = $scope.rsyncdProps.password;
        if ($scope.hsyncProps.role == 'slave') {
          $scope.hsyncSettings.host = $scope.hsyncProps.MasterHost;
        } else if ($scope.hsyncProps.role == 'master') {
          $scope.hsyncSettings.host = $scope.hsyncProps.SlaveHost;
        }
        if ($scope.hsyncProps.role !== '' && $scope.hsyncProps.role !== undefined) {
          $scope.hsyncConfigured = true;
        }
        $scope.roleSaved = $scope.hsyncSettings.role;
        $scope.hsyncSettings.sqlSync = $scope.hsyncProps.databases;
        $scope.$apply();
      });
    }
    $scope.getProps();

    $scope.setRole = function(role) {
      if (role != $scope.hsyncSettings.role) {
        $scope.hsyncSettings.password = '';
        $scope.hsyncSettings.host = '';
      }
      $scope.hsyncSettings.role = role;
    }

    $scope.setProp = function(host, password, role) {
      return $scope.db.open().then(function() {
        if (role != '' || role != undefined) {
          if (role == 'slave') {
            var hostKey = 'MasterHost';
          } else if (role == 'master') {
            var hostKey = 'SlaveHost';
          }
          $scope.db.setProp('hotsync', 'role', role);
          $scope.db.setProp('hotsync', hostKey, host);
          $scope.db.setProp('rsyncd', 'password', password);
          return $scope.db.save();
        }
      }).then(function() {
        return nethserver.signalEvent('nethserver-hotsync-update').then(function() {
          $scope.getProps();
          console.log($scope.hsyncSettings.host);
        });
      });
    }

    $scope.setHotsyncStatus = function(status) {
      return $scope.db.open().then(function() {
        $scope.db.setProp('hotsync', 'status', status);
        return $scope.db.save();
      }).then(function() {
        return nethserver.signalEvent('nethserver-hotsync-update').then(function() {
          $scope.getProps();
        });
      });
    }

    $scope.clearSettings = function() {
      if ($scope.hsyncProps.role !== undefined) {
        if ($scope.hsyncProps.role == 'slave') {
          $scope.hsyncSettings.host = $scope.hsyncProps.MasterHost;
        } else if ($scope.hsyncProps.role == 'master') {
          $scope.hsyncSettings.host = $scope.hsyncProps.SlaveHost;
        }
        $scope.hsyncSettings.password = $scope.rsyncdProps.password;
        $scope.hsyncSettings.role = $scope.hsyncProps.role;
      } else {
        $scope.hsyncSettings.host = '';
        $scope.hsyncSettings.password = '';
        $scope.hsyncSettings.role = '';
      }
    }

    $scope.hideShowPasswd = function() {
      var inputType = $('#passwdHotsync').attr('type');
      if (inputType == 'password') {
        $('#passwdHotsync').attr('type', 'text');
        $('#passwdIcon').removeClass('fa-eye');
        $('#passwdIcon').addClass('fa-eye-slash');
      } else if (inputType == 'text') {
        $('#passwdHotsync').attr('type', 'password');
        $('#passwdIcon').removeClass('fa-eye-slash');
        $('#passwdIcon').addClass('fa-eye');
      }
    }

    $scope.setMysqlSync = function(status) {
      return $scope.db.open().then(function() {
        $scope.db.setProp('hotsync', 'databases', status);
        return $scope.db.save();
      }).then(function() {
        return nethserver.signalEvent('nethserver-hotsync-update').then(function() {
          $scope.getProps();
        });
      });
    }

    // i18n labels
    $scope.labels = {
      app_header: _('NethServer Hotsync'),
      section_status_title: _('Status'),
      section_status_card1_header: _('Hotsync Status'),
      section_status_enabled: _('Enabled'),
      section_status_disabled: _('Disabled'),
      section_status_card1_body1: _('Set Hotsync status as enabled'),
      section_status_card1_body2: _('Set Hotsync status as disabled'),
      section_status_card1_action1: _('Enable Hotsync'),
      section_status_card1_action2: _('Disable Hotsync'),
      section_status_card2_header: _('Mysql Synchronization'),
      section_status_card2_body: _('If Mysql is installed, it will be synchronized by default'),
      section_status_card2_action1: _('Enable Mysql'),
      section_status_card2_action2: _('Disable Mysql'),
      section_settings_title: _('Settings'),
      section_settings_form_label1: _('Local Server Role'),
      section_settings_form_selectval0: _('Select role'),
      section_settings_form_selectval1: _('Master'),
      section_settings_form_selectval2: _('Slave'),
      section_settings_form_label2_1: _('Remote Master IP'),
      section_settings_form_label2_2: _('Remote Slave IP'),
      section_settings_form_label3: _('Password'),
      section_settings_form_label3_ps: _('The password must be the same for Slave and Master!'),
      section_settings_form_save: _('Save'),
      section_settings_form_cancel: _('Cancel')
    }

  }]);
