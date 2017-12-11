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
        if ($scope.hsyncProps.role == 'master') {
          $scope.hsyncSettings.host = $scope.hsyncProps.MasterHost;
        } else if ($scope.hsyncProps.role == 'slave') {
          $scope.hsyncSettings.host = $scope.hsyncProps.SlaveHost;
        }
        $scope.hsyncSettings.sqlSync = $scope.hsyncProps.databases;
        $scope.$apply();
      });
    }
    $scope.getProps();

    $scope.setRole = function(role) {
      $scope.hsyncSettings.role = role;
    }

    $scope.setProp = function(host, password, role) {
      return $scope.db.open().then(function() {
        if (role != '' || role != undefined) {
          if (role == 'master') {
            var hostKey = 'MasterHost';
          } else if (role == 'slave') {
            var hostKey = 'SlaveHost';
          }
          $scope.db.setProp('hotsync', hostKey, host);
          $scope.db.setProp('rsyncd', 'password', password);
          $scope.db.setProp('hotsync', 'role', role);
          return $scope.db.save();
        }
      }).then(function() {
        return nethserver.signalEvent('nethserver-hotsync-update').then(function() {
          $scope.getProps();
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
