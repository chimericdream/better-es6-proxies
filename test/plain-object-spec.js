const proxy = require('../src/proxy');
const getPlainObject = require('./helpers/plain-object');

const chai = require('chai');

const should = chai.should;
const expect = chai.expect;
const assert = chai.assert;

describe('When proxying a plain object', () => {
    describe('and specifying proxied properties', () => {
        it('should expose sub-properties contained in the specified top-level property', () => {
            const plain = proxy(getPlainObject(), [], ['data']);
            expect(plain.propA).to.not.be.undefined;
            expect(plain.propB).to.not.be.undefined;

            expect(plain.propA).to.equal('this is prop a');
            expect(plain.propB).to.equal('this is prop b');
        });

        it('should not affect properties already at the top level', () => {
            const plain = proxy(getPlainObject(), [], ['data']);
            expect(plain.propC).to.not.be.undefined;
            expect(plain.propC).to.equal('this is prop c');
        });

        it('should allow access to the proxied members', () => {
            const plain = proxy(getPlainObject(), [], ['data']);
            expect(plain.propA).to.equal(plain.data.propA);
            expect(plain.propB).to.equal(plain.data.propB);
        });

        it('should allow proxied properties to be modified', () => {
            const plain = proxy(getPlainObject(), [], ['data']);
            expect(plain.data.propA).to.equal('this is prop a');
            plain.propA = 'prop a has changed';
            expect(plain.data.propA).to.equal('prop a has changed');
        });

        it('should allow existing non-proxied properties to be modified', () => {
            const plain = proxy(getPlainObject(), [], ['data']);
            expect(plain.propC).to.equal('this is prop c');
            plain.propC = 'prop c has changed';
            expect(plain.propC).to.equal('prop c has changed');
        });

        it('should allow new properties to be set on the main object', () => {
            const plain = proxy(getPlainObject(), [], ['data']);
            expect(plain.data.propE).to.be.undefined;
            expect(plain.propE).to.be.undefined;

            plain.propE = 'this is prop e';

            expect(plain.data.propE).to.be.undefined;
            expect(plain.propE).to.not.be.undefined;
            expect(plain.propE).to.equal('this is prop e');
        });
    });

    describe('and specifying read-only properties', () => {
        it('should allow non-read-only properties to be modified', () => {
            const plain = proxy(getPlainObject(), ['data', 'propD']);
            expect(plain.propC).to.equal('this is prop c');
            plain.propC = 'prop c has been changed';
            expect(plain.propC).to.equal('prop c has been changed');
        });

        it('should not allow read-only sub-properties to be modified', () => {
            const plain = proxy(getPlainObject(), ['data', 'propD']);
            expect(plain.data.propA).to.equal('this is prop a');
            let shouldThrow = function() {
                plain.data.propA = 'prop a has been changed';
            };
            expect(shouldThrow).to.throw('propA is not a writable property of this Object.');
        });

        it('should not allow read-only properties to be modified', () => {
            const plain = proxy(getPlainObject(), ['data', 'propD']);
            expect(plain.propD).to.equal('this is prop d');
            let shouldThrow = function() {
                plain.propD = 'prop d has been changed';
            };
            expect(shouldThrow).to.throw('propD is not a writable property of this Object.');
        });
    });

    describe('and marking all properties as read-only via wildcard', () => {
        it('should not allow any properties to be modified', () => {
            const plain = proxy(getPlainObject(), '*');
            expect(plain.propD).to.equal('this is prop d');
            let shouldThrow = function() {
                plain.propD = 'prop d has been changed';
            };
            expect(shouldThrow).to.throw('All properties of this Object are read-only.');
        });

        it('should not allow any sub-properties to be modified', () => {
            const plain = proxy(getPlainObject(), '*');
            expect(plain.data.propA).to.equal('this is prop a');
            let shouldThrow = function() {
                plain.data.propA = 'prop a has been changed';
            };
            expect(shouldThrow).to.throw('data.propA is not a writable property of this Object.');
        });
    });

    describe('and specifying both read-only and proxied properties', () => {
        it('should not allow sub-properties of a read-only property to be modified', () => {
            const plain = proxy(getPlainObject(), ['data'], ['data']);
            expect(plain.propA).to.equal('this is prop a');
            let shouldThrow = function() {
                plain.propA = 'prop a has been changed';
            };
            expect(shouldThrow).to.throw('propA is not a writable property of this Object.');
        });
    });

    describe('when accessing methods from Object.prototype', () => {
        it('should not throw an exception accessing a method inherited from Object.prototype', () => {
            const plain = proxy(getPlainObject(), ['data'], ['data']);
            expect(plain.toString()).to.equal('[object Object]');
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

        it('should log proxied properties correctly using console.log', () => {
            const plain = proxy(getPlainObject(), ['data'], ['data']);
            hook = captureStream(process.stdout);
            console.log(plain.propA);
            hook.unhook();
            expect(hook.captured()).to.contain('this is prop a');
        });

        it('should log proxied properties correctly using console.dir', () => {
            const plain = proxy(getPlainObject(), ['data'], ['data']);
            hook = captureStream(process.stdout);
            console.dir(plain.propA);
            hook.unhook();
            expect(hook.captured()).to.contain('this is prop a');
        });
    });
});
