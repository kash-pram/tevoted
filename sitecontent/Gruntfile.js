// Generated on 2014-06-13 using generator-angular 0.8.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-karma');

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Adds annotations for angular so it can be minified
    ngAnnotate: {
        options: {
            // Task-specific options go here. 
        },
        dist: {
            files:[{
              expand:true,
              src: ['<%= yeoman.app %>/components/**/*.js']
            }] 
        },
    },

    // removes unused css. great for bootstrap bloat
    // right now just hitting vendor.css
    purifycss: {
      options: {},
      target: {
        src: [
          '<%= yeoman.dist %>/*.html',
          '<%= yeoman.dist %>/**/*.html',
          '<%= yeoman.dist %>/scripts/*.js',
          '<%= yeoman.dist %>/assets/js/*.js'
        ],
        css: ['<%= yeoman.dist %>/assets/styles/vendor.css'],
        dest: '<%= yeoman.dist %>/assets/styles/vendor.css'
      },
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        //tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      compass: {
        files: ['<%= yeoman.app %>/assets/styles/**/*.{scss,sass}'],
        tasks: ['compass:server']
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles','autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/**/*.js',
          '<%= yeoman.app %>/**/*.html',
          '.tmp/assets/styles/*.css',
          '<%= yeoman.app %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9001,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 27883,
      },
      livereload: {
        options: {
          middleware: function(connect, options, middlewares) {
            var modRewrite = require('connect-modrewrite');
            var rules = [
                "!\\.html|\\.woff|\\.woff2|\\.ttf|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.gif$ /index.html [L]"
            ];
            // enable Angular's HTML5 mode
            middlewares.unshift(modRewrite(rules));

            return middlewares;
          },
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/assets/styles',
        cssDir: '.tmp/assets/styles',
      },
      dist: {},
      server: {
        options: {
          debugInfo: true,
          sassDir: '<%= yeoman.app %>/assets/styles',
        	cssDir: '.tmp/assets/styles',
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/assets/styles/{,*/}*.css'
            // '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    cssmin: {
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    // messes stuff up, and gzip handles most of this anyways. not worth it.
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },


    // changes env variable for dev vs production
    ngconstant: {
      options: {
        name: 'env-config',
        wrap: '"use strict";\n\n{%= __ngModule %}',
        space: ''
      },
      development: {
        options: {
          dest: '<%= yeoman.app %>/config/EnvVariables.js',
        },
        constants: {
          ENV: 'development'
        }
      },
      production: {
        options: {
          dest: '<%= yeoman.app %>/config/EnvVariables.js',
        },
        constants: {
          ENV: 'production'
        }
      }
    },


    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '**/*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '<%= yeoman.app %>/assets',
          dest: '<%= yeoman.dist %>/assets',
          src: [
            'images/**',
            'js/**',
            'fonts/**'
          ]
        },{
          expand: true,
          cwd: 'bower_components/font-awesome/fonts',
          dest: '<%= yeoman.dist %>/assets/fonts',
          src:[
            '*'
          ]
        }]
      },
      styles: {
      	files:[{
      		expand: true,
	        cwd: '<%= yeoman.app %>/styles',
	        dest: '.tmp/styles/',
	        src: '{,*/}*.css'
      	},{
      		expand: true,
	        cwd: 'bower_components/',
	        dest: '.tmp/bower_components/',
	        src: '**'
      	}]
        
      },
      js: {
        files:[{
          expand: true,
          cwd: '.tmp/concat/styles',
          dest: '<%= yeoman.dist %>/styles/',
          src: '**'
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'ngconstant:development',
      'concurrent:server',
      'compass:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'karma',
    'ngconstant:production',
    'compass',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'ngAnnotate',
    'concat',
    'copy:dist',
    'copy:js',
    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    //'purifycss', //disabling because takes forever now
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
