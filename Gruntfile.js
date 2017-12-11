module.exports = function (grunt) {
  var globalObj = {
    i18nFilesList: [],
    i18nFiles: []
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['dist/**'],
    clean: {
      build: ['dist/**'],
      remove: ['.tmp']
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/index.html']
    },
    copy: {
      html: {
        src: './app/index.html',
        dest: 'dist/index.html'
      },
      manifests: {
        expand: true,
        cwd: 'app/',
        src: ['manifest.json', 'override.json'],
        dest: 'dist/'
      },
      assets: {
        expand: true,
        cwd: 'app/assets/',
        src: ['*'],
        dest: 'dist/assets/'
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html',
        }
      }
    },
    shell: {
      rsync: {
        command: function (login, port, source, dest) {
          return "rsync -aiz -e 'ssh -p " + port + "' " + source + " " + login + ':' + dest;
        },
      },
      compress: {
        command: function () {
          return "cd dist; tar cvzf ../nethserver-cockpit-hotsync.tar.gz *";
        }
      },
      listFiles: {
        command: function () {
          return "ls -1 app/i18n/*.json";
        },
        options: {
          callback: function (err, stdout, stderr, cb) {
            globalObj.i18nFilesList = stdout.split('\n').slice(0, -1);
            cb();
          }
        }
      }
    },
    xgettext: {
      options: {
        functionName: "_",
        potFile: "app/i18n/en_US.pot",
      },
      target: {
        files: {
          javascript: ['app/scripts/*.js']
        }
      }
    },
    po2json: {
      options: {
        format: 'raw'
      },
      all: {
        src: ['app/i18n/**/*.po', 'app/i18n/**/*.pot'],
        dest: 'app/i18n/'
      }
    },
    mustache_render: {
      your_target: {
        options: {
          escape: false
        },
        files: globalObj.i18nFiles
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-xgettext');
  grunt.loadNpmTasks('grunt-po2json');
  grunt.loadNpmTasks('grunt-mustache-render');

  grunt.registerTask('build', 'Make .js files in under dist/', [
    'clean:build',
    'copy:html',
    'copy:manifests',
    'copy:assets',
    'useminPrepare',
    'concat',
    'uglify',
    'cssmin',
    'usemin',
    'htmlmin',
    'clean:remove'
  ]);
  grunt.registerTask('rsync', 'Sync folder with remote host', function (login, port, dest) {
    if (port === undefined) {
      port = 22;
    }
    if (dest === undefined) {
      dest = '~/.local/share/cockpit/nethserver';
    }
    grunt.task.run([
      'shell:manifest', ['shell:rsync', login, port, 'dist/', dest].join(':'),
    ]);
  });

  grunt.registerTask('lang-extract', 'Extract strings and generate en_US.pot file', ['xgettext']);
  grunt.registerTask('lang-create', 'Generate po.js files for each supported languages', function () {
    for (var f in globalObj.i18nFilesList) {
      var lang = globalObj.i18nFilesList[f];
      var JSONdata = grunt.file.readJSON(lang);
      var obj = {
        template: "app/i18n/po.tpl",
        data: {
          langData: JSON.stringify(JSONdata)
        },
      };
      if (lang === "app/i18n/en_US.json") {
        obj.dest = 'dist/po/api/po.js';
      } else {
        obj.dest = 'dist/po/api/po.' + lang.split('/')[1].split('_')[0] + '.js';
      }
      globalObj.i18nFiles.push(obj);
    }
  });

  grunt.registerTask('release', 'Create release file', ['shell:compress']);
  grunt.registerTask('lang-compile', 'Extract strings and generate en_US.pot file', ['po2json', 'shell:listFiles', 'lang-create', 'mustache_render']);

};
