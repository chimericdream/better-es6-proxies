module.exports = class SimpleClass {
    constructor() {
        this.data = {
            'propA': 'this is prop a',
            'propB': 'this is prop b',
            'nestedA': {
                'subPropA': 'this is sub prop A'
            }
        };

        this.propC = 'this is prop c';
        this.propD = 'this is prop d';
    }

    methodA() {
        return 'this is method a';
    }

    methodB() {
        return 'this is method b';
    }
};
