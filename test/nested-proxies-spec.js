const proxy = require('../src/proxy');
const SimpleClass = require('./helpers/simple-class');

const chai = require('chai');
const sinon = require('sinon');

const should = chai.should;
const expect = chai.expect;
const assert = chai.assert;

class OuterClass {
    constructor() {
        this.data = {
            'outerPropA': 'this is outer prop a',
            'outerPropB': 'this is outer prop b',
            'dataInner': proxy(new SimpleClass(), ['data'], ['data']),
            'dataInnerNonProxy': {
                'simple': proxy(new SimpleClass(), ['data'], ['data'])
            }
        };

        this.inner = proxy(new SimpleClass(), ['data'], ['data']);
        this.innerNonProxy = {
            'simple': proxy(new SimpleClass(), ['data'], ['data'])
        };
    }
};

class ComplexOuterClass {
    constructor() {
        this.data = {
            'complexOuterPropA': 'this is complex outer prop a',
            'complexOuterPropB': 'this is complex outer prop b',
            'dataInner': proxy(new OuterClass(), ['data'], ['data']),
            'dataSimple': proxy(new SimpleClass(), ['data'], ['data']),
            'dataInnerNonProxy': {
                'simple': proxy(new SimpleClass(), ['data'], ['data']),
                'outer': proxy(new OuterClass(), ['data'], ['data'])
            }
        };

        this.inner = proxy(new OuterClass(), ['data'], ['data']);
        this.simple = proxy(new SimpleClass(), ['data'], ['data'])
        this.innerNonProxy = {
            'simple': proxy(new SimpleClass(), ['data'], ['data']),
            'outer': proxy(new OuterClass(), ['data'], ['data'])
        };
    }
};

describe('When a proxied class contains a property which itself is a proxy', () => {
    let nested;

    describe('and accessing proxied properties on the inner proxy object', () => {
        beforeEach(() => {
            nested = proxy(new OuterClass(), ['data'], ['data']);
        });

        it('should work', () => {
            expect(nested.inner.propA).to.equal('this is prop a');
        });
    });
});

describe('When a nested proxies are more than one level deep', () => {
    let complex;

    describe('and accessing proxied properties on the inner proxy objects', () => {
        beforeEach(() => {
            complex = proxy(new ComplexOuterClass(), ['data'], ['data']);
        });

        it('should correctly access properties on the first level proxy', () => {
            expect(complex.inner.outerPropA).to.equal('this is outer prop a');
            expect(complex.inner.outerPropB).to.equal('this is outer prop b');
        });

        it('should correctly access properties on the deeper proxy', () => {
            expect(complex.inner.inner.propA).to.equal('this is prop a');
            expect(complex.inner.inner.propB).to.equal('this is prop b');
        });
    });
});

describe('When a proxied property of a class is itself is a proxy', () => {
    let outer;

    describe('and accessing properties on the inner proxy object', () => {
        beforeEach(() => {
            outer = proxy(new OuterClass(), ['data'], ['data']);
        });

        it('should correctly retrieve non-proxied members of the inner proxy object', () => {
            expect(outer.dataInner.propC).to.equal('this is prop c');
            expect(outer.dataInner.methodA()).to.equal('this is method a');
        });

        it('should correctly retrieve proxied members of the inner proxy object', () => {
            expect(outer.dataInner.propA).to.equal('this is prop a');
        });
    });
});

describe('When a nested proxies are contained in proxied class members', () => {
    let complex;

    describe('and accessing proxied properties on the inner proxy objects', () => {
        beforeEach(() => {
            complex = proxy(new ComplexOuterClass(), ['data'], ['data']);
        });

        it('should correctly access proxied properties on the first level proxy', () => {
            expect(complex.dataInner.outerPropA).to.equal('this is outer prop a');
            expect(complex.dataInner.outerPropB).to.equal('this is outer prop b');
        });

        it('should correctly access non-proxied properties on the first level proxy', () => {
            expect(complex.dataInner.inner.propA).to.equal('this is prop a');
            expect(complex.dataInner.inner.propB).to.equal('this is prop b');
        });

        it('should correctly access proxied properties on the deeper proxy', () => {
            expect(complex.dataInner.dataInner.propA).to.equal('this is prop a');
            expect(complex.dataInner.dataInner.propB).to.equal('this is prop b');
        });

        it('should correctly access non-proxied properties on the deeper proxy', () => {
            expect(complex.dataInner.inner.propA).to.equal('this is prop a');
            expect(complex.dataInner.inner.propB).to.equal('this is prop b');
        });
    });
});
