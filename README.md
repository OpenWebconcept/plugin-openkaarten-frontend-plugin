# OpenKaarten Frontend Plugin

This plugin adds a Gutenberg block to WordPress which can be used to show a map with locations of datalayers, from the OpenKaarten Base plugin.

## Requirements

### OpenKaarten Frontend

In order to make the OpenKaarten Frontend Plugin work, you will need to have a WordPress installation with at least the following installed (and activated):

* [WordPress](https://wordpress.org/)

On this WordPress installation you will have to enable pretty permalinks (Settings > Permalinks > Select any of the options that is not plain).

There are two possible setups for the OpenKaarten Frontend, this can be:

1. On the WordPress installation of an existing website.
2. On a completely new WordPress installation.

In all scenarios the OpenKaarten Frontend plugin needs to have the following installed (and activated):

* [WordPress](https://wordpress.org/)
* [OpenKaarten Frontend](https://github.com/OpenWebconcept/plugin-openkaarten-frontend-plugin)

With this installed you can use the OpenKaarten Frontend plugin in your WordPress website.

If you chose for option 2 (new WordPress installation), you will probably need to install a WordPress theme. Since the OpenKaarten plugin is a REST API, it can be used in any WordPress theme.

## Works best with

The OpenKaarten Frontend plugin works best with the following plugins, which can be installed on a different WordPress installation:

- [OpenKaarten Base](https://github.com/openwebconcept/plugin-openkaarten-base): This plugin adds Datalayers and Locations to WordPress which can be retrieved via the OpenKaarten REST API.
- [OpenKaarten GeoData](https://github.com/OpenWebconcept/plugin-openkaarten-geodata-for-posts): This plugin adds GeoData fields to the OpenPub Items post type and creates a REST endpoint to retrieve OpenPub Items with geodata.

## Installation

### Manual installation

You can download the latest release from the [releases page](https://github.com/OpenWebconcept/plugin-openkaarten-frontend-plugin) and install it manually in your WordPress installation.

### Composer installation

1. `composer source git@github.com:OpenWebconcept/plugin-openkaarten-frontend-plugin.git`
2. `composer require acato/openkaarten-frontend-plugin`
3. `cd /wp-content/plugins/openkaarten-frontend-plugin`
4. `npm install && npm run build`
5. Activate the OpenKaarten Frontend Plugin through the 'Plugins' menu in WordPress.

## Usage

### Add a Gutenberg blok to show a map with locations
In the WordPress admin panel, go to the page or post where you want to show the map with locations. Add a new block and search for the 'OWC Openmaps Openstreet Map' block.
Add this block to the page or post, add a URL where the OpenKaarten Base plugin is installed and select the datalayer(s) you want to show on the map.

## Development

### Coding Standards

Please remember, we use the WordPress PHP Coding Standards for this plugin! (https://make.wordpress.org/core/handbook/best-practices/coding-standards/php/) To check if your changes are compatible with these standards:

*  `cd /wp-content/plugins/openkaarten-frontend`
*  `composer install` (this step is only needed once after installing the plugin)
*  `./vendor/bin/phpcs --standard=phpcs.xml.dist .`
*  See the output if you have made any errors.
    *  Errors marked with `[x]` can be fixed automatically by phpcbf, to do so run: `./vendor/bin/phpcbf --standard=phpcs.xml.dist .`

N.B. the `composer install` command will also install a git hook, preventing you from committing code that isn't compatible with the coding standards.

### NPM
The plugin uses NPM for managing the JavaScript dependencies and building the leaflet map for showing locations within a datalayer. To install the dependencies, run the following command:
```
npm install
```

To deploy the JavaScript files, run the following command:
```
npm run build
```

To watch the JavaScript files for changes, run the following command:
```
npm run watch
```
