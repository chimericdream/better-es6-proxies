'use strict';

const isObject = obj => obj && typeof obj === 'object';

function innerProxy(obj, className, readOnly, builtPropName = '') {
    return new Proxy(obj, {
        get: function(target, prop) {
            if (prop === '__isProxy') {
                return true;
            }
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
                if (isObject(target[prop]) && !target[prop].__isProxy) {
                    return innerProxy(target[prop], className, readOnly, propname);
                }
                return target[prop];
            }

            return undefined;
        },

        set: function(target, prop, value) {
            let propname = `${builtPropName}.${prop}`;
            if (readOnly) {
                throw new Error(`${propname} is not a writable property of this ${className}.`);
            }

            target[prop] = value;
            return true;
        }
    });
}

module.exports = function proxy(obj, readOnlyMembers = [], proxiedMembers = []) {
    return new Proxy(obj, {
        get: function(target, prop) {
            if (prop === '__isProxy') {
                return true;
            }
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
                if (isObject(target[prop]) && !target[prop].__isProxy) {
                    const isReadOnly = readOnlyMembers.includes(prop) || readOnlyMembers === '*';
                    return innerProxy(target[prop], target.constructor.name, isReadOnly, prop);
                }
                return target[prop];
            }

            let retval, hasreturn = false;
            proxiedMembers.forEach((member) => {
                if (prop in target[member]) {
                    hasreturn = true;
                    if (isObject(target[member][prop]) && !target[member][prop].__isProxy) {
                        retval = innerProxy(target[member][prop], target.constructor.name, readOnlyMembers.includes(member), `${member}.${prop}`);
                    } else {
                        retval = target[member][prop];
                    }
                }
            });
            if (hasreturn) {
                return retval;
            }

            return undefined;
        },
        set: function(target, prop, value) {
            if (readOnlyMembers !== '*' && readOnlyMembers.includes(prop)) {
                throw new Error(`${prop} is not a writable property of this ${target.constructor.name}.`);
            }

            if (target.hasOwnProperty(prop)) {
                if (readOnlyMembers === '*') {
                    throw new Error(`All properties of this ${target.constructor.name} are read-only.`);
                }
                target[prop] = value;
                return true;
            }

            let shouldReturn = false;
            proxiedMembers.forEach((member) => {
                if (prop in target[member]) {
                    if (readOnlyMembers.includes(member)) {
                        throw new Error(`${prop} is not a writable property of this ${target.constructor.name}.`);
                    }
                    if (readOnlyMembers === '*') {
                        throw new Error(`All properties of this ${target.constructor.name} are read-only.`);
                    }
                    target[member][prop] = value;
                    shouldReturn = true;
                }
            });

            if (shouldReturn) {
                return true;
            }

            target[prop] = value;
            return true;
        }
    });
};
