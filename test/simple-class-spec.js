const proxy = require('../src/proxy');
const SimpleClass = require('./helpers/simple-class');

const chai = require('chai');
const sinon = require('sinon');

const should = chai.should;
const expect = chai.expect;
const assert = chai.assert;

describe('When proxying a simple class', () => {
    let simple;

    describe('and specifying proxied properties', () => {
        beforeEach(() => {
            simple = proxy(new SimpleClass(), [], ['data']);
        });

        it('should expose sub-properties contained in the specified top-level property', () => {
            expect(simple.propA).to.not.be.undefined;
            expect(simple.propB).to.not.be.undefined;

            expect(simple.propA).to.equal('this is prop a');
            expect(simple.propB).to.equal('this is prop b');
        });

        it('should not affect class properties already at the top level', () => {
            expect(simple.propC).to.not.be.undefined;
            expect(simple.propC).to.equal('this is prop c');
        });

        it('should not affect the ability to call class methods', () => {
            expect(simple.methodA).to.not.be.undefined;
            expect(simple.methodB).to.not.be.undefined;

            expect(typeof simple.methodA).to.equal('function');
            expect(typeof simple.methodB).to.equal('function');
        });

        it('should allow access to the proxied members', () => {
            expect(simple.propA).to.equal(simple.data.propA);
            expect(simple.propB).to.equal(simple.data.propB);
        });

        it('should allow proxied properties to be modified', () => {
            expect(simple.data.propA).to.equal('this is prop a');
            simple.propA = 'prop a has changed';
            expect(simple.data.propA).to.equal('prop a has changed');
        });

        it('should allow existing non-proxied properties to be modified', () => {
            expect(simple.propC).to.equal('this is prop c');
            simple.propC = 'prop c has changed';
            expect(simple.propC).to.equal('prop c has changed');
        });

        it('should allow new properties to be set on the main object', () => {
            expect(simple.data.propE).to.be.undefined;
            expect(simple.propE).to.be.undefined;

            simple.propE = 'this is prop e';

            expect(simple.data.propE).to.be.undefined;
            expect(simple.propE).to.not.be.undefined;
            expect(simple.propE).to.equal('this is prop e');
        });
    });

    describe('and specifying read-only properties', () => {
        beforeEach(() => {
            simple = proxy(new SimpleClass(), ['data', 'propD']);
        });

        it('should allow non-read-only properties to be modified', () => {
            expect(simple.propC).to.equal('this is prop c');
            simple.propC = 'prop c has been changed';
            expect(simple.propC).to.equal('prop c has been changed');
        });

        it('should not allow read-only sub-properties to be modified', () => {
            expect(simple.data.propA).to.equal('this is prop a');
            let shouldThrow = function() {
                simple.data.propA = 'prop a has been changed';
            };
            expect(shouldThrow).to.throw('propA is not a writable property of the SimpleClass class.');
        });

        it('should not allow read-only properties to be modified', () => {
            expect(simple.propD).to.equal('this is prop d');
            let shouldThrow = function() {
                simple.propD = 'prop d has been changed';
            };
            expect(shouldThrow).to.throw('propD is not a writable property of the SimpleClass class.');
        });
    });

    describe('and specifying both read-only and proxied properties', () => {
        beforeEach(() => {
            simple = proxy(new SimpleClass(), ['data'], ['data']);
        });

        it('should not allow sub-properties of a read-only property to be modified', () => {
            expect(simple.propA).to.equal('this is prop a');
            let shouldThrow = function() {
                simple.propA = 'prop a has been changed';
            };
            expect(shouldThrow).to.throw('propA is not a writable property of the SimpleClass class.');
        });
    });

    describe('when accessing methods from Object.prototype', () => {
        beforeEach(() => {
            simple = proxy(new SimpleClass(), ['data'], ['data']);
        });

        it('should not throw an exception accessing a method inherited from Object.prototype', () => {
            expect(simple.toString()).to.equal('[object Object]');
        });
    });

    describe('when accessing properties via console.log or console.dir', () => {
        function captureStream(stream) {
            var oldWrite = stream.write;
            var buf = '';
            stream.write = function(chunk, encoding, callback){
                buf += chunk.toString(); // chunk is a String or Buffer
            }

            return {
                unhook: function unhook(){
                    stream.write = oldWrite;
                },
                captured: function(){
                    return buf;
                }
            };
        }

        beforeEach(() => {
            simple = proxy(new SimpleClass(), ['data'], ['data']);
        });

        it('should log proxied properties correctly using console.log', () => {
            hook = captureStream(process.stdout);
            console.log(simple.propA);
            hook.unhook();
            expect(hook.captured()).to.equal('this is prop a\n');
        });

        it('should log proxied properties correctly using console.dir', () => {
            hook = captureStream(process.stdout);
            console.dir(simple.propA);
            hook.unhook();
            expect(hook.captured()).to.equal('\'this is prop a\'\n');
        });
    });
});
