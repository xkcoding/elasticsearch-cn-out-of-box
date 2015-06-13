/*! kibana - v3.1.2 - 2015-03-05
 * Copyright (c) 2015 Rashid Khan; Licensed Apache License */

define("factories/store",["angular","lodash"],function(a,b){var c=a.module("kibana.factories");c.factory("storeFactory",function(){return function(a,c,d){if(!b.isFunction(a.$watch))throw new TypeError("Invalid scope.");if(!b.isString(c))throw new TypeError("Invalid name, expected a string that the is unique to this store.");if(d&&!b.isPlainObject(d))throw new TypeError("Invalid defaults, expected a simple object or nothing");d=d||{};var e=localStorage.getItem(c);if(null!=e)try{e=JSON.parse(e)}catch(f){e=null}if(null==e)e=b.clone(d);else{if(!b.isPlainObject(e))throw new TypeError("Invalid store value"+e);b.defaults(e,d)}return a[c]=e,a.$watch(c,function(e){void 0===e?(localStorage.removeItem(c),a[c]=b.clone(d)):localStorage.setItem(c,JSON.stringify(e))},!0),e}})}),define("lib/ClusterState/popFirstIndexAndReturnEndpoint",[],function(){return function(a){var b=a.shift();return"/"+b+"/cluster_state/_search"}}),define("lib/ClusterState/getState",["require","lib/ClusterState/popFirstIndexAndReturnEndpoint"],function(a){var b=a("lib/ClusterState/popFirstIndexAndReturnEndpoint");return function c(a,d,e){if(0===e.length)throw new Error("Cluster State could not be found");var f=d.elasticsearch+b(e),g={size:1,sort:{"@timestamp":{order:"desc"}}},h=function(b){var f;return 0!==b.data.hits.total?(f=b.data.hits.hits[0]._source,f._id=b.data.hits.hits[0]._id,f._index=b.data.hits.hits[0]._index,f._type=b.data.hits.hits[0]._type,f):c(a,d,e)},i=function(){return c(a,d,e)};return a.post(f,g).then(h,i)}}),define("lib/ClusterState/getIndices",["require","moment"],function(a){var b=a("moment");return function(a,c){var d=b.utc(),e=b.utc().subtract(c.current.index.interval,3),f=c.current.index.interval,g=c.current.index.pattern;return a.indices(e,d,g,f)}}),define("lib/ClusterState/refreshState",[],function(){return function(a,b,c){return c().then(function(c){var d=function(b){return b&&b["@timestamp"]!==a.version&&(a.state=b,a.version=b["@timestamp"],a.$emit("update",b)),b},e=function(b){return a.$emit("error",b),b};return b(c).then(d,e)})}}),define("lib/ClusterState/filterShards",["require","lodash"],function(a){var b=a("lodash");return function(a,c,d){return d=b.isUndefined(d)?!1:d,function(e){var f="INITIALIZING"===e.state&&!b.isEmpty(e.relocating_node);return e.state===a&&e.primary===c&&(d||!f)}}}),define("lib/ClusterState/incrementIndexShardStatusCount",[],function(){return function(a){return function(b,c){return b[c.index]||(b[c.index]={}),b[c.index][a]?b[c.index][a]+=1:b[c.index][a]=1,b}}}),define("lib/extractShards",["require","lodash"],function(a){var b=a("lodash"),c=function(a){function c(b){var c=a.nodes[b.node];return b.nodeName=c&&c.name||null,b.type="shard","INITIALIZING"===b.state&&b.relocating_node&&(b.relocating_message="Relocating from "+a.nodes[b.relocating_node].name),"RELOCATING"===b.state&&(b.relocating_message="Relocating to "+a.nodes[b.relocating_node].name),b}if(!a)return[];var d=function(a){e.push(c(a))},e=[];return b.each(a.routing_nodes.nodes,function(a){b.each(a,d)}),b.each(a.routing_nodes.unassigned,d),e},d=function(a){return a&&a._id};return b.memoize(c,d)}),define("lib/ClusterState/groupIndicesByState",["require","lodash","./filterShards","./incrementIndexShardStatusCount","lib/extractShards"],function(a){var b=a("lodash"),c=a("./filterShards"),d=a("./incrementIndexShardStatusCount"),e=a("lib/extractShards"),f=function(a,e,f,g,h){var i="red"===f;return h=h||{},b.chain(a).filter(function(a){return b.isUndefined(h[a.index])}).filter(c(g.toUpperCase(),i)).reduce(d(g.toLowerCase()),e[f]).value()};return function(a){var c=e(a.state),d={red:{},yellow:{},green:{}},g=b.partial(f,c,d);d.red=g("red","UNASSIGNED"),d.red=g("red","INITIALIZING"),d.yellow=g("yellow","UNASSIGNED",d.red),d.yellow=g("yellow","INITIALIZING",d.red);var h=b.merge({},d.red,d.yellow);return d.green=g("green","STARTED",h),d}}),define("lib/ClusterState/explainStatus",["require","./groupIndicesByState","lodash"],function(a){var b=a("./groupIndicesByState"),c=a("lodash"),d=function(a,b,d){var e=c.templateSettings;c.templateSettings={escape:/<%-([\s\S]+?)%>/g,evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};var f="",g={status:a,index:b,counts:d};return g.type="red"===a?{single:"primary",multi:"primaries"}:{single:"replica",multi:"replicas"},f+="<%- index %> has ",f+=d.unassigned?1===d.unassigned?"an unassigned <%- type.single %>":"<%= counts.unassigned %> unassigned <%- type.multi %>":1===d.initializing?"an initializing <%- type.single %>":"<%= counts.initializing %> initializing <%- type.multi %>",f=c.template(f,g),c.templateSettings=e,f},e=function(a){return function(b){return a===b}},f=function(a){return[/^\./.test(a),a]};return function(a,g,h){h||(h=b(a));var i=c(h.yellow).keys().sortBy(f).value(),j=c(h.red).keys().sortBy(f).value();c.isUndefined(g)||(j=c.filter(j,e(g)),i=c.filter(i,e(g))),i=c.difference(i,j);var k=[];return c.each(j,function(a){k.push(d("red",a,h.red[a]))}),c.each(i,function(a){k.push(d("yellow",a,h.yellow[a]))}),k}}),define("services/../../../common/PhoneHome",["require","lodash","jquery"],function(a){function b(a){this._id=a._id||"marvelOpts",this._type=a._type||"appdata",this.client=a.client||d,this.baseUrl=a.baseUrl,this.index=a.index,this.attributes=c.defaults({},e),this.events={},this.currentBaseUrl=this.baseUrl,this.fieldsToES=["registrationData","status","version","report"],this.fieldsToBrowser=["trialTimestamp","lastReport","registrationSent","report","status"];var b=this;this.on("change:data",function(a){b.sendIfDue(a),b.checkAndSendRegistrationData()})}var c=a("lodash"),d=a("jquery"),e={report:!0,status:"trial"};return b.prototype={on:function(a,b){c.isArray(this.events[a])||(this.events[a]=[]),this.events[a].push(b)},clear:function(a){delete this.events[a]},trigger:function(){var a=Array.prototype.slice.call(arguments),b=a.shift();this.events[b]&&c.each(this.events[b],function(b){b.apply(null,a)})},setBaseUrl:function(a){this.baseUrl=a},set:function(a,b){var d,e=this;"object"==typeof a?(d=c.pick(this.attributes,c.keys(a)),this.attributes=c.assign(this.attributes,a),c.each(a,function(a,b){e.trigger("change:"+b,a,d[b])})):(d=this.attributes[a],this.attributes[a]=b,this.trigger("change:"+a,b,d))},get:function(a){return c.isUndefined(a)?this.attributes:this.attributes[a]},setTrialTimestamp:function(a){this.set("trialTimestamp",a),this.saveToBrowser()},saveToES:function(){var a=c.pick(this.attributes,this.fieldsToES),b=this.baseUrl+"/"+this.index+"/"+this._type+"/"+this._id;return this.client.put(b,a)},saveToBrowser:function(){var a=c.pick(this.attributes,this.fieldsToBrowser);localStorage.setItem(this._id,JSON.stringify(a))},saveAll:function(){return this.saveToBrowser(),this.saveToES()},destroy:function(){var a=this.baseUrl+"/"+this.index+"/"+this._type+"/"+this._id;return localStorage.removeItem(this._id),this.client["delete"](a)},checkReportStatus:function(){var a=864e5,b=!1,d=!c.isEmpty(this.currentBaseUrl)&&this.currentBaseUrl!==this.baseUrl;return this.currentBaseUrl=this.baseUrl,this.get("version")&&this.get("report")&&(d&&(b=!0),this.get("lastReport")||(b=!0),(new Date).getTime()-parseInt(this.get("lastReport"),10)>a&&(b=!0)),b?!0:!1},checkRegistratonStatus:function(){var a=6048e5,b=(new Date).getTime()-parseInt(this.get("trialTimestamp"),10)>a;return"trial"===this.get("status")&&b},sendIfDue:function(a){var b=this;return this.checkReportStatus()?this.client.post(this.getStatsReportUrl(),a).then(function(){b.set("lastReport",(new Date).getTime()),b.saveToBrowser()}):void 0},register:function(a){var b=this;return a.creationDate=(new Date).toISOString(),this.set("registrationData",a),this.set("status","registered"),b.saveToBrowser(),b.saveToES()},confirmPurchase:function(a){var b=this;return a.creationDate=(new Date).toISOString(),this.set("registrationData",a),this.set("status","purchased"),this.set("registrationSent",!1),b.saveToBrowser(),b.saveToES()},checkAndSendRegistrationData:function(){var a=this,b=this.get("registrationData"),c=this.get("data"),d=this.getRegistrationUrl();return!this.get("registrationSent")&&b&&c&&c.uuid?(b.uuid=c.uuid,"purchased"===this.get("status")&&(d=this.getPurchaseConfirmationUrl()),this.client.post(d,b).then(function(){a.set("registrationSent",!0),a.saveToBrowser()})):void 0},fetch:function(){var a,b=this;try{a=JSON.parse(localStorage.getItem(b._id)),this.set(a)}catch(d){}var f=c.transform(b.fieldsToES,function(a,b){a[b]=e[b]},{});delete f.report;var g=this.baseUrl+"/"+this.index+"/"+this._type+"/"+this._id;return this.client.get(g).then(function(a){var d=c.defaults(a.data._source,f);return b.set(d),b.saveToBrowser(),b.attributes},function(){b.set(f),b.saveToBrowser()})},getStatsReportUrl:function(){return"https://marvel-stats.elasticsearch.com/"},getRegistrationUrl:function(){return"https://marvel-stats.elasticsearch.com/registration"},getPurchaseConfirmationUrl:function(){return"https://marvel-stats.elasticsearch.com/purchase_confirmation"}},b}),define("services/marvel/index",["require","angular","app","config","lodash","lib/ClusterState/getState","lib/ClusterState/getIndices","lib/ClusterState/refreshState","lib/ClusterState/explainStatus","lib/ClusterState/groupIndicesByState","../../../../common/PhoneHome"],function(a){var b=a("angular"),c=a("app"),d=a("config"),e=a("lodash"),f=a("lib/ClusterState/getState"),g=a("lib/ClusterState/getIndices"),h=a("lib/ClusterState/refreshState"),i=a("lib/ClusterState/explainStatus"),j=a("lib/ClusterState/groupIndicesByState"),k=a("../../../../common/PhoneHome"),l=b.module("marvel.services",[]);return c.useModule(l),l.factory("$clusterState",["$rootScope","$http","kbnIndex","dashboard",function(a,b,c,k){var l=e.partial(f,b,d),m=e.partial(g,c,k),n=a.$new(!0);n.state=!1,n.version=0;var o=e.partial(h,n,l,m);return n.refresh=o,n.refresh(),a.$on("refresh",n.refresh),n.explainStatus=i.bind(null,n),n.groupIndicesByState=j.bind(null,n),n}]),l.factory("$phoneHome",["$http",function(a){return new k({client:a,baseUrl:d.elasticsearch,index:d.kibana_index})}]),l}),define("panels/marvel/cluster/module",["angular","app","kbn","lodash","factories/store","services/marvel/index"],function(a,b,c,d){var e=a.module("kibana.panels.marvel.cluster",["marvel.services"]);b.useModule(e),e.controller("marvel.cluster",["$scope","$modal","$q","$http","$clusterState","dashboard","filterSrv","kbnVersion","cacheBust","$phoneHome",function(b,c,e,f,g,h,i,j,k,l){b.panelMeta={modals:[],editorTabs:[],status:"Stable",description:"A simple view of cluster health<p>"};var m={title:"Cluster Status"};d.defaults(b.panel,m),b.init=function(){b.kbnVersion=j,b.$on("refresh",function(){b.get_data()}),g.$on("update",b.updateHealthStatusData),b.updateHealthStatusData(),b.get_data()},b.get_data=function(a,c){var e,f;b.panel.error=!1,0!==h.indices.length&&(f=d.isUndefined(a)?0:a,e=b.ejs.Request().indices(h.indices[f]),e=e.query(b.ejs.FilteredQuery(b.ejs.QueryStringQuery("_type:cluster_stats"),i.getBoolFilter(i.ids))).size(1).sort([b.ejs.Sort("@timestamp").order("desc")]),b.populate_modal(e),e.doSearch().then(function(a){return b.panelMeta.loading=!1,0===f&&(b.data=void 0,c=b.query_id=(new Date).getTime()),d.isUndefined(a.error)?void(b.query_id===c&&(b.data=d.isArray(a.hits.hits)?a.hits.hits[0]._source:void 0,l.set("data",b.data),d.isUndefined(b.data)&&f+1<h.indices.length&&b.get_data(f+1,b.query_id))):void(b.panel.error=b.parse_error(a.error))}))},b.healthClass=function(a,b){switch(a){case"green":return b?"":"text-success";case"yellow":return"text-warning";case"red":return"text-error";default:return""}},b.populate_modal=function(c){b.inspector=a.toJson(JSON.parse(c.toString()),!0)},b.updateHealthStatusData=function(){b.healthStatusData={updatedForStatus:g.state.status,explainMessages:g.explainStatus()}}}]),e.filter("formatBytes",function(){return function(a){return d.isUndefined(a)?"":c.byteFormat(a)}}),e.filter("formatShort",function(){return function(a,b){return d.isUndefined(a)?"":c.shortFormat(a,b)}}),e.filter("formatNumber",function(){return function(a,b){return d.isUndefined(a)?"":a.toFixed(b)}}),e.filter("formatTime",function(){return function(a,b){if(d.isUndefined(a))return"";a/=1e3;var c="";return 3600>a?(a/=60,c=" m"):86400>a?(a/=3600,c=" h"):(a/=86400,c=" d"),a.toFixed(b)+c}})});