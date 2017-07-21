import {chai, assert} from 'meteor/practicalmeteor:chai';
import {MochaHelpers} from'meteor/jkuester:meteor-mocha-helpers';
import {Mongo} from 'meteor/mongo';

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
		const doc = {title: "test"};
		MochaHelpers.isDocumentDefined(doc);
		MochaHelpers.isDocumentDefined(doc, {title: 1});

		assert.throws(function () {
			MochaHelpers.isDocumentDefined(doc, {title: 1, notDefined: 1});
		})
	});

	it("hasAllEntriesOf", function () {
		MochaHelpers.hasAllEntriesOf([1, 2, 3, 4], [1, 2, 3, 4]);
		MochaHelpers.hasAllEntriesOf(["1", "2", "3", "4"], ["1", "2", "3", "4"]);
		let f = function () {};
		MochaHelpers.hasAllEntriesOf([f], [f]);
		let o = {};
		MochaHelpers.hasAllEntriesOf([o], [o]);
	});
});

///////////////////////////////////////////////////////////////////////////////

describe("MOCKING HELPERS", function () {

	let dummy;

	it("crateDummyCollection", function () {
		dummy = MochaHelpers.crateDummyCollection("dummy");
		assert.equal(dummy instanceof Mongo.Collection, true);
	});

	it("mockCollection", function () {
		dummy = MochaHelpers.crateDummyCollection("dummy");
		MochaHelpers.mockCollection(dummy, "dummyMock", {
			title: "some dummy",
		});
	});

	it("createMockDoc", function () {
		const mockDoc = MochaHelpers.createMockDoc("dummyMock", {
			title: "some dummy",
		});
		assert.equal(mockDoc.title, "some dummy");
	});

	it("getDefaultPropsWith", function () {
		MochaHelpers.setDefaultProps({
			foo: "bar"
		});
		const mockDoc = MochaHelpers.createMockDoc("dummyMock", MochaHelpers.getDefaultPropsWith());
		assert.equal(mockDoc.foo, "bar");
	});

	it("userFct", function () {
		const userFct = MochaHelpers.userFct();
		MochaHelpers.isDefined(userFct);
		MochaHelpers.isDefined(userFct._id);
		assert.equal(userFct.username, "john doe");

		const customUserFct = MochaHelpers.userFct("01234", "test");
		assert.equal(customUserFct._id, "01234");
		assert.equal(customUserFct.username, "test");

		Meteor.user = MochaHelpers.userFct;
		assert.equal(Meteor.user().username, "john doe");
	});

	it("userIdFct", function () {
		const userId = MochaHelpers.userIdFct();
		MochaHelpers.isDefined(userId);

		Meteor.userId = MochaHelpers.userIdFct;
		MochaHelpers.isDefined(Meteor.userId());
	});

	it("mockUser", function () {
		MochaHelpers.mockUser();
		assert.equal(Meteor.user().username, "john doe");
	});


})

if (Meteor.isServer) {

///////////////////////////////////////////////////////////////////////////////

	describe("Method Helpers", function () {

		it("testMethod", function () {
			const testMethod = MochaHelpers.testMethod(MochaHelpers.TEST_METHOD);
			const myArgument = MochaHelpers.userIdFct();
			const result = testMethod._execute({myArgument}, myArgument);
			assert.equal(result, myArgument);
		})

		it("removeMethod", function () {

			if (!Meteor.server.method_handlers[MochaHelpers.TEST_METHOD]){
				const testMethod = MochaHelpers.testMethod(MochaHelpers.TEST_METHOD);
				MochaHelpers.isDefined(Meteor.server.method_handlers[MochaHelpers.TEST_METHOD]);
			}
			MochaHelpers.removeMethod(MochaHelpers.TEST_METHOD);
			MochaHelpers.isNotDefined(Meteor.server.method_handlers[MochaHelpers.TEST_METHOD]);
		})
	});

///////////////////////////////////////////////////////////////////////////////


	describe("Publication Helpers", function () {

		it("collectPublication", function (done) {

			const collection = new Mongo.Collection("pubtest");
			MochaHelpers.mockUser();
			Meteor.publish("testpub", function(){
				const data = collection.find();
				if (data && data.count() > 0)
					return data;

				this.ready();
			})
			collection.insert({});
			MochaHelpers.collectPublication(Meteor.user()._id,"testpub", "pubtest", 1, done )

		});

	});

}


///////////////////////////////////////////////////////////////////////////////

describe("Schema Helpers", function () {

	it("setSchema", function () {

		const schemaObj = {
			foo:"bar"
		};
		const defaultSchema = MochaHelpers.setSchema(schemaObj);
		MochaHelpers.isDefined(defaultSchema);
		assert.deepEqual(schemaObj, defaultSchema);
	})

	it("defaultSchema", function () {

		MochaHelpers._defaultSchema = null;

		assert.throws(function () {
			MochaHelpers.defaultSchema();
		})

		const defaultSchema = MochaHelpers.setSchema({
			foo:"bar"
		});

		MochaHelpers.isDefined(MochaHelpers.defaultSchema());
		assert.deepEqual(defaultSchema, MochaHelpers.defaultSchema());
	})

});

///////////////////////////////////////////////////////////////////////////////

describe("Translation Helpers", function () {

	it("mockTranslation", function () {
		const i18n = MochaHelpers.mockTranslation();
		MochaHelpers.isDefined(i18n);
	});

	it ("setSource", function () {
		const i18n = MochaHelpers.mockTranslation();
		const source = {"test":{
			"foo":"bar"
		}}
		const newSource = i18n.setSource(source);
		assert.deepEqual(newSource, source);
	});

	it ("__ (translates)", function () {
		const i18n = MochaHelpers.mockTranslation();
		const source = {"test":{
			"foo":"bar"
		}}
		const newSource = i18n.setSource(source);
		assert.deepEqual(newSource, source);

		const translated = i18n.__("test.foo");
		assert.equal(translated, "bar");

		const notInSource = "test.notInSource";
		const same = i18n.__(notInSource);
		assert.equal(same, notInSource);
	})
});