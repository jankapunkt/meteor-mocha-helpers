import {chai, assert} from 'meteor/practicalmeteor:chai';
import {MochaHelpers} from'meteor/jkuester:meteor-mocha-helpers';

///////////////////////////////////////////////////////////////////////////////

describe("COMMON ASSERTION HELPERS", function () {

	it("isDefined", function () {
		MochaHelpers.isDefined({}, MochaHelpers.OBJECT);
		MochaHelpers.isDefined(1, MochaHelpers.NUMBER);
		MochaHelpers.isDefined("087654321", MochaHelpers.STRING);
		MochaHelpers.isDefined([], MochaHelpers.ARRAY);
		MochaHelpers.isDefined(function () {}, MochaHelpers.FUNCTION);
	});

	it("isNotDefined", function () {
		MochaHelpers.isNotDefined(undefined);
		MochaHelpers.isNotDefined(null);
		let a;
		MochaHelpers.isNotDefined(a);
	});

	it("isDocumentDefined", function () {
		const doc = {title:"test"};
		MochaHelpers.isDocumentDefined(doc);
		MochaHelpers.isDocumentDefined(doc, {title:1});

		assert.throws(function () {
			MochaHelpers.isDocumentDefined(doc, {title:1, notDefined:1});
		})
	});

	it("hasAllEntriesOf", function () {
		MochaHelpers.hasAllEntriesOf([1,2,3,4], [1,2,3,4]);
		MochaHelpers.hasAllEntriesOf(["1","2","3","4"], ["1","2","3","4"]);
		let f = function () {};
		MochaHelpers.hasAllEntriesOf([f], [f]);
		let o = {};
		MochaHelpers.hasAllEntriesOf([o], [o]);
	});
});

///////////////////////////////////////////////////////////////////////////////

describe("MOCKING HELPERS", function () {

	it("crateDummyCollection", function () {
		MochaHelpers.notImplemented();
	});

	it ("mockCollection", function () {
		MochaHelpers.notImplemented();
	});

	it ("createMockDoc", function () {
		MochaHelpers.notImplemented();
	});

	it ("getDefaultPropsWith", function () {
		MochaHelpers.notImplemented();
	});

	it ("userFct", function () {
		MochaHelpers.notImplemented();
	});

	it ("userIdFct", function () {
		MochaHelpers.notImplemented();
	});

	it ("mockUser", function () {
		MochaHelpers.notImplemented();
	});


})