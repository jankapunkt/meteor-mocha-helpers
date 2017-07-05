Package.describe({
	name: 'jkuester:meteor-mocha-helpers',
	version: '0.1.1',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

Package.onUse(function (api) {
	api.versionsFrom('1.5');
	api.use('ecmascript');
	api.use('meteor');
	api.use('random');
	api.use('mongo');
	api.use('dburles:factory@1.1.0');
	api.use('dburles:mongo-collection-instances');
	api.use('johanbrook:publication-collector');
	api.use('practicalmeteor:chai');
	api.use('mdg:validated-method');
	api.mainModule('meteor-mocha-helpers.js');
});


Package.onTest(function (api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('jkuester:meteor-mocha-helpers');
	api.use('practicalmeteor:chai');

	api.mainModule('meteor-mocha-helpers-tests.js');
});