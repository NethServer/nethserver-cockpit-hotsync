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

    $scope.hsyncSettings = {
      'host': '',
      'password': '',
      'role': '',
      'sqlSync': '',
      'status': ''
    }

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
      $scope.hsyncSettings.host = '';
      $scope.hsyncSettings.password = '';
      $scope.hsyncSettings.role = '';
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
  }]);
