Package.describe({
	name: 'jkuester:meteor-mocha-helpers',
	version: '0.1.3',
	// Brief, one-line summary of the package.
	summary: 'Loose collection of some functions that help you out in your mocha tests.',
	// URL to the Git repository containing the source code for this package.
	git: 'https://github.com/jankapunkt/meteor-mocha-helpers.git',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md',
	debugOnly: true
});

Package.onUse(function (api) {
	api.versionsFrom('1.5');
	api.use('ecmascript');
	api.use('meteor');
	api.use('random');
	api.use('mongo');
	api.use('dburles:factory@1.1.0');
	api.use('dburles:mongo-collection-instances@0.3.5');
	api.use('johanbrook:publication-collector@1.0.10');
	api.use('practicalmeteor:chai@2.1.0');
	api.use('mdg:validated-method@1.1.0');
	api.mainModule('meteor-mocha-helpers.js');
});