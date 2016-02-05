/*global define*/
/*jslint white:true,browser:true*/
define([
    'kb/common/html'
], function (html) {
    'use strict';
    function getRef(params) {
        if (params.ref) {
            return params.ref;
        }
        if (params.workspaceId) {
            if (!params.objectId) {
                throw new Error('Object id required if workspaceId supplied');
            }
            var ref = [params.workspaceId, params.objectId];
            if (params.objectVersion) {
                ref.push(params.objectVersion);
            }
            return ref.join('/');
        }
        throw new Error('Either a ref property or workspaceId, objectId, and optionally objectVersion required to make a ref');
    }

    function workspaceIdentity(params) {
        if (params.workspaceId) {
            return {
                id: params.workspaceId
            };
        }
        if (params.workspaceName) {
            return {
                workspace: params.workspaceName
            };
        }
        throw new Error('No valid workpace identity provided; need either workspaceId or workspaceName');
    }
    
    function objectIdentity(params) {
        var identity = {};
        
        if (params.objectRef) {
            identity.ref = params.objectRef;
        } else {        
            if (params.workspaceId) {
                identity.wsid = params.workspaceId
            } else if (params.workspaceName) {
                identity.workspace = params.workspaceName
            } else {
                throw new Error('No valid workspace identify provided; need either workspaceId or workspaceName');
            }

            if (params.objectId) {
                identity.objid = params.objectId;
            } else if (params.objectName) {
                identity.name = params.objectName;
            } else {
                throw new Error('No valid object identity provided; need either objectId or objectName');
            }

            if (params.objectVersion) {
                identity.ver = params.objectVersion;
            }
        }
        
        console.log(identity);
        
        return identity;
    }

    function getType(value) {
        var type = typeof value;
        switch (type) {
            case 'undefined':
            case 'string':
                // just for fun ... detect ref
                var splitUp = value.split(/\//);
                if (splitUp.length === 3) {
                    if (splitUp.every(function (el) {
                        return el.match(/[\d]+/);
                    })) {
                       return 'ref'; 
                    }
                    return 'string';
                }
            case 'number':
            case 'boolen':
                return type;
            case 'object':
                if (value === null) {
                    return 'null';
                }
                if (value instanceof Array) {
                    return 'array';
                }
                if (value instanceof Date) {
                    return 'date';
                }
                return type;
            default:
                return type;
        }
    }

    function formatValue(value) {
        var t = html.tag,
            a = t('a'),
            ul = t('ul'),
            li = t('li'),
            i = t('i'),
            span = t('span'),
            table = t('table'), tr = t('tr'), th = t('th'), td = t('td');
        switch (getType(value)) {
            case 'undefined':
                return i({style: {color: 'orange'}}, 'n/a');
            case 'string':
                return span({style: {color: 'green'}}, value);
            case 'ref':
                return a({href: '#dataview/' + value}, value);
            case 'number':
                return span({style: {color: 'green'}}, String(value));
            case 'array':
                if (value.length === 0) {
                    return i('empty');
                }
                return ul(
                    value.map(function (item) {
                        return li({style: {color: 'green'}}, formatValue(item));
                    })
                    );
            case 'date':
                return value.toLocaleDateString();
            case 'object':
                if (Object.keys(value).length === 0) {
                    return i('empty');
                }

                return table({class: ['table', 'table-striped'].join(' ')},
                    Object.keys(value)
                    .map(function (key) {
                        return tr([th(key), td(formatValue(value[key]))]);
                    }));

        }
        return '??';
    }

    return {
        getRef: getRef,
        getType: getType,
        formatValue: formatValue,
        workspaceIdentity: workspaceIdentity,
        objectIdentity: objectIdentity        
    };
});