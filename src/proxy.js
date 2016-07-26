'use strict';

const isObject = obj => obj && typeof obj === 'object';

function innerProxy(obj, className, readOnly, builtPropName = '') {
    return new Proxy(obj, {
        get: function(target, prop) {
            if (prop === 'inspect') {
                return prop;
            }
            if (prop in Object.prototype) {
                return Object.prototype[prop];
            }
            if (prop in Symbol.prototype) {
                return;
            }

            let propname = `${builtPropName}.${prop}`;
            if (prop in target) {
                if (isObject(target[prop])) {
                    return innerProxy(target[prop], className, readOnly, propname);
                }
                return target[prop];
            }

            return undefined;
        },

        set: function(target, prop, value) {
            let propname = `${builtPropName}.${prop}`;
            if (readOnly) {
                throw new Error(`${propname} is not a writable property of the ${className} class.`);
            }

            target[prop] = value;
            return true;
        }
    });
}

module.exports = function proxy(obj, readOnlyMembers = [], proxiedMembers = []) {
    return new Proxy(obj, {
        get: function(target, prop) {
            if (prop === 'inspect') {
                return prop;
            }
            if (prop in Object.prototype) {
                return Object.prototype[prop];
            }
            if (prop in Symbol.prototype) {
                return;
            }

            if (prop in target) {
                if (isObject(target[prop])) {
                    return innerProxy(target[prop], target.constructor.name, readOnlyMembers.includes(prop), prop);
                }
                return target[prop];
            }

            let retval, hasreturn = false;
            proxiedMembers.forEach((member) => {
                if (prop in target[member]) {
                    hasreturn = true;
                    if (isObject(target[member][prop])) {
                        retval = innerProxy(target[member][prop], target.constructor.name, readOnlyMembers.includes(member), `${member}.${prop}`);
                    } else {
                        retval = target.options[prop];
                    }
                }
            });
            if (hasreturn) {
                return retval;
            }

            return undefined;
        },
        set: function(target, prop, value) {
            if (readOnlyMembers.includes(prop)) {
                throw new Error(`${prop} is not a writable property of the ${target.constructor.name} class.`);
            }
            proxiedMembers.forEach((member) => {
                if (prop in target[member] && readOnlyMembers.includes(member)) {
                    throw new Error(`${prop} is not a writable property of the ${target.constructor.name} class.`);
                }
            });

            target[prop] = value;
            return true;
        }
    });
};
