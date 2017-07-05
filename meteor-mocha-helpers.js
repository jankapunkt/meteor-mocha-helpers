/* eslint-env mocha */
import {Factory} from 'meteor/dburles:factory';
import {PublicationCollector} from 'meteor/johanbrook:publication-collector';
import {chai, assert} from 'meteor/practicalmeteor:chai';
import {Random} from 'meteor/random';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {ValidatedMethod} from 'meteor/mdg:validated-method';

export const MochaHelpers = {

	debug: false,
	log(args){if (this.debug) console.log(args);},
	TEST_METHOD: "MochaHelpers.testmethod",

	NOT_YET_IMPLEMENTED: "not yet implemented",
	notImplemented(){
		assert.fail(this.NOT_YET_IMPLEMENTED);
	},

	///////////////////////////////////////////////////////////////////////////
	// COMMON ASSERTION HELPERS
	///////////////////////////////////////////////////////////////////////////

	STRING:"string",
	NUMBER:"number",
	FUNCTION:"function",
	OBJECT:"object",
	ARRAY:"array",

	isDefined(value, type = null, optionalMessage="") {
		assert.isDefined(value, optionalMessage);
		assert.isNotNull(value, optionalMessage);
		if (type) {
			assert.typeOf(value, type, "wrong type assertion: expected " +
				type + " but got " + (typeof type) + " <" + optionalMessage + ">");
		}
	},

	isNotDefined(value) {
		if ((value !== null && typeof value !== 'undefined') || (value && value.hasOwnProperty('length') && value.length > 0))
			throw new Error("expected to be undefined or null: " + value + " => " + typeof value);
	},

	_defaultFields: null,

	setDefaultFields(fields) {
		this._defaultFields = fields;
	},

	isDocumentDefined(document, fields=null) {
		this.isDefined(document, 'object');
		if (!fields) fields = this._defaultFields;
		if (!fields) fields = [];
		for (let fieldKey in fields) {
			this.isDefined(document[fieldKey]);
		}
	},

	hasAllEntriesOf(source, target) {
		//are all default keys in this schema's keys?
		for (let key of source) {
			assert.notEqual(target.indexOf(key), -1, "<"+key+">");
		}
	},

	///////////////////////////////////////////////////////////////////////////
	// MOCKING HELPERS
	///////////////////////////////////////////////////////////////////////////

	// COLLECTION LEVEL

	crateDummyCollection(name) {
		const coll = Mongo.Collection.get(name);
		return coll ? coll : new Mongo.Collection(name);
	},

	mockCollection(collection, mockName, defaultProps) {
		//console.log("mockCollection", Factory, Factory.define, Meteor.isServer, Meteor.isClient);
		Factory.define(mockName, collection, defaultProps).after(insertDoc => {
			// hook after insert
			MochaHelpers.isDefined(insertDoc, 'object');
		});
		const doc = Factory.build(mockName);
		MochaHelpers.isDefined(doc, 'object');

		const createDoc = Factory.create(mockName);
		MochaHelpers.isDefined(createDoc, 'object');

		collection.remove({_id: createDoc._id});
	},

	// DOCUMENT LEVEL

	createMockDoc(collectionName, props) {
		return Factory.create(collectionName, props);
	},

	getDefaultPropsWith(customProps = {}) {
		return Object.assign({}, {
			title: "title title",
			code: Random.id(5),
			description: "aljkd dqwpd ndadpajd nadapdjn asdas dpajüi pk jiüoj ns",
			createdBy: Random.id(),
			createdAt: new Date().getTime()
		}, customProps);
	},

	// USER LEVEL

	userFct: function () {
		return {_id: Random.id(17), username: "john doe"};
	},

	userIdFct: function () {return Random.id(17);},

	mockUser() {
		const userfct = MochaHelpers.userFct;
		MochaHelpers.userFct = Meteor.user;
		Meteor.user = userfct;
	},


	///////////////////////////////////////////////////////////////////////////
	// METHOD TESTING HELPERS
	///////////////////////////////////////////////////////////////////////////

	testMethod(methodName) {
		return new ValidatedMethod({
			name: methodName,
			validate({myArgument}) {},
			run(args){
				console.log("test methoid");
				return args;
			}
		});
	},

	removeMethod(methodName) {
		if (Meteor.server.method_handlers[methodName]) {
			delete Meteor.server.method_handlers[methodName];
		}
	},

	///////////////////////////////////////////////////////////////////////////
	// PUBLICATION TESTING HELPERS
	///////////////////////////////////////////////////////////////////////////

	collectPublication(userId, publicationName, collectionName, expectedDocCount, done) {
		const collector = userId
			? new PublicationCollector({userId: userId})
			: new PublicationCollector();
		try {
			collector.collect(publicationName, (factorycollections) => {
				//console.log("collector:", factorycollections[collectionName] );
				if (!factorycollections[collectionName] && expectedDocCount == 0)
					MochaHelpers.isNotDefined(factorycollections[collectionName]);
				else {
					chai.assert.equal(factorycollections[collectionName].length, expectedDocCount);
				}
				if (done) done();
			});
		}catch(err) {
			done(err);
		}
	},

	collectPublicationWithParen() {
		// TODO
	},

	///////////////////////////////////////////////////////////////////////////
	// COLLECTION TESTING HELPERS
	///////////////////////////////////////////////////////////////////////////

	_defaultSchema:null,

	setSchema(schema) {
		this._defaultSchema = schema;
	},

	defaultSchema() {
		if (!MochaHelpers._defaultSchema)
			throw new Meteor.Error("You have to provide your own schema in order to make use of schema testing abilities.");
		return this._defaultSchema;
	},



	///////////////////////////////////////////////////////////////////////////
	// MISC MOCKINGS
	///////////////////////////////////////////////////////////////////////////

	mockTranslation(){
		return {
			_source:null,
			setSource:function (json) {
				this._source = typeof json === MochaHelpers.STRING
					? JSON.parse(json)
					: json;
			},
			"__":function (input) {
				if (!this._source) return input;
				const split = input.split(".");

				let ret = this._source[split.shift()];

				if (typeof ret === MochaHelpers.STRING)
					return ret;
				if (typeof ret === "undefined")
					return input;
				for (let part of split) {
					ret = ret[part];

					if (typeof ret === MochaHelpers.STRING)
						return ret;
					if (typeof ret === "undefined")
						return input;
				}
				if (typeof ret === MochaHelpers.STRING)
					return ret;
				else
					return input;
			}
		}
	},
}
