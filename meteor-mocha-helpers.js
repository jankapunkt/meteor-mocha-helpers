/* eslint-env mocha */
import {Factory} from 'meteor/dburles:factory';
import {PublicationCollector} from 'meteor/johanbrook:publication-collector';
import {chai, assert} from 'meteor/practicalmeteor:chai';
import {Random} from 'meteor/random';
import {Meteor} from 'meteor/meteor';

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

	isDefined(value, type = null) {
		assert.isDefined(value);
		assert.isNotNull(value);
		if (type) {
			assert.typeOf(value, type, "wrong type assertion: expected " +
				type + " but got " + (typeof type));
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
			assert.notEqual(target.indexOf(key), -1);
		}
	},

	///////////////////////////////////////////////////////////////////////////
	// MOCKING HELPERS
	///////////////////////////////////////////////////////////////////////////

	// COLLECTION LEVEL

	crateDummyCollection(name) {
		return new Mongo.Collection(name);
	},

	mockCollection(collection, mockName, defaultProps) {
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

	///////////////////////////////////////////////////////////////////////////
	// PUBLICATION TESTING HELPERS
	///////////////////////////////////////////////////////////////////////////

	collectPublication(userId, publicationName, collectionName, expectedDocCount, done) {
		const collector = userId
			? new PublicationCollector({userId: userId})
			: new PublicationCollector();
		collector.collect(publicationName, (factorycollections) => {
			if (!factorycollections[collectionName] && expectedDocCount == 0)
				assert.isUndefined(factorycollections[collectionName]);
			else {
				chai.assert.equal(factorycollections[collectionName].length, expectedDocCount);
			}
			if (done) done();
		});
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
	// COLLECTION TESTING HELPERS
	///////////////////////////////////////////////////////////////////////////

	testCollection(collectionTestDef) {
		describe('(Collection) ' + collectionTestDef.objName, () => {
			this.defineMockFactory(collectionTestDef);
			this.testMutators(collectionTestDef);
			this.testSchema(collectionTestDef);
			this.testPublications(collectionTestDef);
			this.testMethods(collectionTestDef);
		});
	},

	defineMockFactory(collectionEntry) {
		describe('Factory', () => {
			it('registers a collection to the mocking factory', function (done) {

				const collection = collectionEntry.obj;
				MochaHelpers.isDefined(collection);
				const factoryName = collectionEntry.name;
				MochaHelpers.isDefined(factoryName);
				const factoryProps = MochaHelpers.getDefaultPropsWith(collectionEntry.factoryProps);
				MochaHelpers.isDefined(factoryProps, 'object');
				MochaHelpers.mockCollection(collection, factoryName, factoryProps);
				done();
			});
		});
	},

	testMutators(collectionEntry) {
		describe('Mutators', () => {
			it('builds a document, containing minimum of the schema', () => {

				//DOES THE FACTORY CREATE AT LEAST THE MINIMAL SCHEMA
				const document = Factory.build(collectionEntry.name);
				MochaHelpers.isDocumentDefined(document);
			});

			it('creates a document, containing minimum of the schema', () => {

				//DOES THE FACTORY CREATE AT LEAST THE MINIMAL SCHEMA
				const document = Factory.create(collectionEntry.name);
				MochaHelpers.isDocumentDefined(document);
			});
		});
	},

	testPublications(collectionEntry) {
		const collection = collectionEntry.obj;
		const factoryName = collectionEntry.name;
		const collectionName = collectionEntry.objName;
		const collectionPubs = collectionEntry.publications;
		const factoryProps = MochaHelpers.getDefaultPropsWith(collectionEntry.factoryProps);

		describe('Publications', () => {

			const createDocument = (props = {}) => {
				const document = Factory.create(factoryName, props);
				MochaHelpers.isDefined(document, 'object');
			};

			let userId;

			beforeEach(() => {
				const findUser = Meteor.users.findOne({username: "john doe"});
				if (findUser) {
					userId = findUser._id;
				} else {
					Meteor.users.remove({username: "john doe"});
					userId = Accounts.createUser({username: "john doe"});
				}

				collection.remove({});
				_.times(3, () => createDocument(factoryProps));
			});

			afterEach(() => {
				Meteor.users.remove({_id: userId});
				collection.remove({});
				assert.equal(collection.find({}).count(), 0);
			});


			const publicationList = Object.values(collectionPubs);
			for (let publicationName of publicationList) {

				it(publicationName + " (valid user)", (done) => {
					assert.equal(collection.find({}).count(), 3);
					MochaHelpers.collectPublication(userId, publicationName, collectionName, 3);
					done();
				});

				it(publicationName + " (no logged in user)", (done) => {
					assert.equal(collection.find({}).count(), 3);
					assert.throws(function () {
						MochaHelpers.collectPublication(null, publicationName, collectionName, 3);
					}, Error, CaroContext.errors.PERMISSION_NOT_LOGGED_IN);
					done();
				});

				it(publicationName + " (non registered in user)", (done) => {
					assert.equal(collection.find({}).count(), 3);
					assert.throws(function () {
						MochaHelpers.collectPublication(Random.id(17), publicationName, collectionName, 3);
					}, Error, CaroContext.errors.PERMISSION_NOT_REGISTERED_USER);
					done();
				});

				if (factoryProps.parent) {
					it(publicationName + " (filter by parent, success)", (done) => {
						assert.equal(collection.find({}).count(), 3);
						const collector = new PublicationCollector({userId: userId});
						collector.collect(publicationName, 20, {parent: factoryProps.parent}, (factorycollections) => {
							chai.assert.equal(factorycollections[collectionName].length, 3);
							done();
						});
						//MochaHelpers.collectPublication(userId, publicationName, 3);
					});

					it(publicationName + " (filter by parent, empty)", (done) => {
						assert.equal(collection.find({}).count(), 3);
						const collector = new PublicationCollector({userId: userId});
						collector.collect(publicationName, 20, {parent: Random.id(17)}, (factorycollections) => {
							assert.isUndefined(factorycollections[collectionName]);
							//chai.assert.equal(factorycollections[collectionName].length, 0);
							done();
						});
					});
				}
			}

		});
	},


	testMethods(collectionEntry) {
		describe(collectionEntry.name + ': Methods', () => {
			const methodNames = Object.values(collectionEntry.methods);
			for (let methodName of methodNames) {
				it(methodName, () => {
					assert.fail("not yet implemented");
				});
			}
		});
	},

	testSchema(collectionEntry) {
		const collection = collectionEntry.obj;
		const collectionName = collectionEntry.name;

		describe(collectionName + ': Schema', () => {

			it('has all keys of the defaultSchema', () => {
				const defaultSchema = MochaHelpers.defaultSchema();
				const schema = collection.schema;

				const defaulSchemaKeys = defaultSchema._schemaKeys;
				const schemaKeys = schema._schemaKeys;

				MochaHelpers.hasAllEntriesOf(defaulSchemaKeys, schemaKeys);
			});

			it('has all public fields in its schema', () => {
				const schema = collection.schema._schemaKeys;
				MochaHelpers.isDefined(schema);
				const publicFields = Object.keys(collection.publicFields);
				MochaHelpers.isDefined(schema);
				MochaHelpers.hasAllEntriesOf(publicFields, schema);
			});
		});

	},





	removeMethod(methodName) {
		if (Meteor.server.method_handlers[methodName]) {
			delete Meteor.server.method_handlers[methodName];
		}
	},
}
