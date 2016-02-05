# Data API Dataview Widgets Sample

Javascript code and supporting content to demonstrate sample widgets which utilize the KBase service clients to fetch data and make widgets available by type.

## Quick Start for Developing

It is good to do all of this in a dedicated directory, since you will be cloning two or more repos side by side. =

First, you need to get kbase-ui at [https://gitub.com/kbase/kbase-ui]() and ensure that you are set up and able to do the basic build and preview. 

The *kbase-ui* repo contains seminal documentation; especially relevant is the *quick-deploy.md* description of a standard production deployment of the ui, and *prerequisites* for the build environment. 

The developer deployment differs from the production deploy, although the production deploy is a part of the development workflow (specifically, testing before a pull request is issued.)

In short, the developer build process is:

```
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
make init
make build
make start
make preview
```

This sets up the build environment, builds a developer version of the ui, starts a little static nodejs server at on :8080, and launches the default browser pointed at that local server.

The basic process is then to iterate over

- edit
- make build
- refresh browser

### Developing a Plugin

Install the plugin alongside kbase-ui

- fork ```https://github.com/eapearson/kbase-ui-plugin-dataview-widget-sample```
- clone your fork
    - plugin repos typically, or at least so far, utilize a single master branch, with tags to mark releases.
- in kbase ui, make a developer copy of the build config
    - ```cp -pr kbase-ui/config kbase-ui/dev/config```
    - this places a copy of the standard build configuration into the dev directory, which will override the standard build. This gives you a chance to fiddle with build settings, including inserting your new widget, without the potential of prematurely committing config changes to the project.
- add a stanza for the plugin to the config
    - edit ```kbase-ui/dev/config/ui/dev/build.yml```
        - the build.yml file contains the *dev* version of the *ui* build. This build typically makes available development versions of plugins, and inserts menu items, routes to demo panels.
    - in the plugins section add something like the following. 
        - You will need to set ```root``` to the directory containing your plugin repo. (Note that the root points to the *container* of your repo, not the repo directory itself. The repo directory is taken from the *name* property.)

```
    -
        name: dataview-widget-sample
        globalName: kbase-ui-plugin-dataview-widget-sample
        version: 0.1.0
        cwd: src/plugin
        source:
            # uncomment the bower property to have the build fetch from bower/github
            # bower: {}
            # use something like this to feed bower a specific alternate version spec.
            # in this case a specific github repo and branch
            # bower:
            #     version: you/kbase-ui-plugin-dataview-widget-samplemaster
            # comment this out if bower us activated
            directory: 
                # NB the root is the directory which contains this plugin, which
                # must be located within a directory whose name is the globalName
                root: /Users/you/myprojectroot
``` 

> Tip: it is very convenient (for me, essential) to use an editor that understands yaml syntax and helps you keep the yaml file correctly structured.
    
This setup will allow the "classic" edit-build-refresh workflow to integrate the plugin. (Which will hopefully become clear below).

Since this sample plugin contains a menu item definition, we need to update the ui build to include this menu item in the hamburger menu. This is accomplished by editing the ```settings.yml``` file alongside the *config.yml* that you just edited.

- edit ```kbase-ui/dev/config/ui/dev/settings.yml```
- in the array of menu item ids in *menus/authenticated/developer* add ```dataview_widget_sample``` as the first list item (or in whichever position you prefer).

If you hop back into kbase-ui and issue ```make build``` you should see the plugin in the menu. If you select the menu item, you should see a sample page with the globally readable FBA object 1052/34/1.

Clicking on any object reference should open up the dataview for that object. Of note is that this plugin adds a new dataview widget for ExpressionMatrix. It is a very simple widget, which is actually an exact copy of the Object Info which used for the sample panel.

More on this later...

### Faster Develop Workflow

The default workflow with edit, build, refresh can be a little slow for extended editing sessions.

It is simple to set up a faster edit-refresh workflow. You can link your plugin directly into the build and refrain from running *make build*. For example, something like this from the parent directory of kbase-ui and the plugin:

```
rm -rf kbase-ui/build/build/client/modules/plugins/dataview-widget-sample
ln -s `pwd`/kbase-ui-plugin-dataview-widget-sample/src/plugin kbase-ui/build/build/client/modules/plugins/dataview-widget-sample
```

This will let you simply refresh the ui after you have made changes to the dataview widget sample code, and see the changes reflected immediately. Some browsers like to hang onto cached copies of the files, so you may need to work out the best method of hard-refreshing your browser. (This may also be an artifact of the simple nodejs preview server when accessing files through a symbolic link like this.)

> This is as far as I've gotten this morning with documenting the sample plugin ... more when I get into work.

## Anatomy of the plugin

### File layout

- LICENSE
- README.md
- bower.json
- package.json
- **src**
    - **plugin**
        - **modules**
            - **widgets**
            - **resources**
        - config.yml

LICENSE
: Standard KBase open source license

README.md
: Description of the plugin, with pointers to additional documentation. See the KBase open source standards (??).

bower.json
: Bower configuration file, required for registration with bower, and to negotiate requirements when integrated into kbase-ui or any other host environment.

package.json [optional]
: NPM configuration file for build and testing tools. At present most plugins do not support this, but we will need to implement this as soon as practical.

src
: All source code is located with on the src directory

src/plugin
: All plugin code is located within the src/plugin directory

src/plugin/modules
: All AMD loadable code is located here

src/plugin/config.yml
: This is the primary configuration file for the plugin. It is used by the host environment to integrate the plugin. See the section below detailing the contents of the config file.

src/plugin/modules/resources
: Required if any resources are to be utilized by the plugin, otherwise optional

src/plugin/modules/widgets
: Optional, but recommended to provide subdirectories for role-specific modules. This avoids the need to provide the module role within the filename.

> TODO: testing framework

### Configuration

### Panel

### Widget

### Dataview Widget

## Registering in Bower

[ coming soon ] 


## Integrating into the Developer and Production Build

### Developer Build

The configuration file you copied into kbase-ui/dev will not be commited in to the project. This protects the project integrity, but also does not add your plugin to the ui either. To incorporate it into the ui, you just need to add a stanza as before, but this time have it loaded from bower:

- edit kbase-ui/config/ui/dev.yml
- add the following stanza to the plugins section:

```
    -
        name: data-landing-pages
        globalName: kbase-ui-plugin-data-landing-pages
        version: 0.1.0
        cwd: src/plugin
        source:
            bower:
                version: kbase/kbase-ui-plugin-data-landing-pages#master
```

Note that this does not require registration with bower, it is pulled straight from github.

If you want the developer build to go against your personal account, because that is where rapid change is happening, then you may want to swap kbase/ with youraccount/. Note that this is a little dodgy since other developers may pick up work-in-progress pushes. To protect against that, make periodic semver tags and update and push up the developer config as need be:

```
    -
        name: data-landing-pages
        globalName: kbase-ui-plugin-data-landing-pages
        version: 0.1.0
        cwd: src/plugin
        source:
            bower:
                version: you/kbase-ui-plugin-data-landing-pages#v0.1.0
```

Not here that the semver tag "v0.1.0" is the full tag string, and that a branch or tag may be used in the version property. Also note that whereas the github semver tag is prefixed with a "v", the version specification "0.1.0" operates with the bower registry, which expects a standard semver string.

### Production Build

[ coming soon ]
