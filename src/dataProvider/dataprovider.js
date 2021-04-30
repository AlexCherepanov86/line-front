// import {baseUrl} from '.baseUrl';
// import inMemoryJWT from 'ra-in-memory-jwt';
import {fetchUtils} from 'ra-core';
import {stringify} from 'query-string';

const apiUrl = "http://127.0.0.1:3005/api";

const httpClient = fetchUtils.fetchJson;

export default {
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
       console.log(params.sort)
//         const query = {
//             sort: JSON.stringify([field, order]),
// //             sort: JSON.stringify([{'column: ${params.sort.field}', order}]),
//             range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
//             perpage: JSON.stringify(perPage),
// //             filter: JSON.stringify(params.filter),
//         };
        const query = {
            ...fetchUtils.flattenObject(params.filter),
            sort: field,
            order: order,
            start: (page - 1) * perPage,
            end: page * perPage,
            perpage: perPage,
        };
        const url = `${apiUrl}?${stringify(query)}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json,
            total: parseInt(headers.get('Content-Range').split('/').pop(), 10)
        }));
    },
}
// const httpClientAuthToken = (url,options={}) => {
//
//         options.headers = new Headers({ Accept: 'application/json' });
//
//         const token = inMemoryJWT.getToken();
//
//         if (token) {
//         options.headers.set('Authorization', `Bearer ${token}`);
//
//         options.credentials = 'include';
//         options.cache = "no-cache";
//         return fetchUtils.fetchJson(url, options);
//     } else {
//         inMemoryJWT.setRefreshTokenEndpoint(baseUrl+'/refresh-token');
//         return inMemoryJWT.getRefreshedToken().then((gotFreshToken) => {
//             if (gotFreshToken) {
//                 options.headers.set('Authorization', `Bearer ${inMemoryJWT.getToken()}`);
//             };
//
//             return fetchUtils.fetchJson(url, options);
//         });
//     }
//     };

// export default (apiUrl, httpClient = fetchUtils.fetchJson) => ({
// getList: (resource, params) => {
//         const { page, perPage } = params.pagination;
//         const { field, order } = params.sort;
//         const query = {
//             sort: JSON.stringify([field, order]),
//             range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
//             filter: JSON.stringify(params.filter),
//         };
//         const url = `${apiUrl}`;
//
//         return httpClient(url).then(({ headers, json }) => ({
//             data: json,
//             total: parseInt(headers.get('content-range').split('/').pop(), 10),
//         }));
//     },

//     getList: async (resource, params) => {
//         const {page, perPage} = params.pagination;
//         const {field, order} = params.sort;
//         const query = {
//             ...fetchUtils.flattenObject(params.filter),
//             _sort: field,
//             _order: order,
//             _start: (page - 1) * perPage,
//             _end: page * perPage,
//         };
//
//         const url = `${apiUrl}/${resource}?${stringify(query)}`;
//         if ( resource==='Ticket' ) {
//             const {headers, json} = await httpClient(url);
//             if (!headers.has('x-total-count')) {
//                 throw new Error(
//                     'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
//                 );
//             }
//             const {Tickets: data, ...rest} = json;
//
//             return {
//                 ...rest,
//                 data,
//                 total: parseInt(
//                     headers
//                         .get('x-total-count')
//                         .split('/')
//                         .pop(),
//                     10
//                 ),
//             };
//         } else { // Стандартный мармелабовский json-server-provider
//             return httpClient(url).then(({ headers, json }) => {
//                 if (!headers.has('x-total-count')) {
//                     throw new Error(
//                         'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
//                     );
//                 }
//                 return {
//                     data: json,
//                     total: parseInt(
//                         headers
//                             .get('x-total-count')
//                             .split('/')
//                             .pop(),
//                         10
//                     ),
//                 };
//             });
//         }
//     },

//     getCounter: (resource, params) => {
//         const query = {
//             ...params
//         };
//
//         const url = `${apiUrl}/${resource}?${stringify(query)}`;
//
//         return httpClient(url).then(({json}) => {
//             const {Counters: data} = json
//             return {
//                 data
//             };
//         });
//     },
//
//     getOne: (resource, params) => {
//         return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({json}) => ({
//             data: json,
//         }))
//     },
//
//
//     getMany: (resource, params) => {
//         const query = {
//             id: params.ids,
//         };
//         const url = `${apiUrl}/${resource}${stringify(query)}`;
//         return httpClient(url).then(({json}) => ({data: json}));
//     },
//
//     getManyReference: (resource, params) => {
//         const {page, perPage} = params.pagination;
//         const {field, order} = params.sort;
//         const query = {
//             ...fetchUtils.flattenObject(params.filter),
//             [params.target]: params.id,
//             _sort: field,
//             _order: order,
//             _start: (page - 1) * perPage,
//             _end: page * perPage,
//         };
//         const url = `${apiUrl}/${resource}?${stringify(query)}`;
//
//         return httpClient(url).then(({headers, json}) => {
//             if (!headers.has('x-total-count')) {
//                 throw new Error(
//                     'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
//                 );
//             }
//             return {
//                 data: json,
//                 total: parseInt(
//                     headers
//                         .get('x-total-count')
//                         .split('/')
//                         .pop(),
//                     10
//                 ),
//             };
//         });
//     },
//
//     update: (resource, params) =>
//         httpClient(`${apiUrl}/${resource}/${params.id}`, {
//             method: 'POST',
//             body: JSON.stringify(params.data),
//         }).then(({json}) => ({data: json})),
//
//     // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
//     updateMany: (resource, params) =>
//         Promise.all(
//             params.ids.map(id =>
//                 httpClient(`${apiUrl}/${resource}/${id}`, {
//                     method: 'PUT',
//                     body: JSON.stringify(params.data),
//                 })
//             )
//         ).then(responses => ({data: responses.map(({json}) => json.id)})),
//
//     create: (resource, params) =>
//         httpClient(`${apiUrl}/${resource}`, {
//             method: 'POST',
//             body: JSON.stringify(params.data),
//         }).then(({json}) => ({
//             data: {...params.data, id: json.id},
//         })),
//
//     delete: (resource, params) =>
//         httpClient(`${apiUrl}/${resource}/${params.id}`, {
//             method: 'DELETE',
//         }).then(({json}) => ({data: json})),
//
//     // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
//     deleteMany: (resource, params) =>
//         Promise.all(
//             params.ids.map(id =>
//                 httpClient(`${apiUrl}/${resource}/${id}`, {
//                     method: 'DELETE',
//                 })
//             )
//         ).then(responses => ({data: responses.map(({json}) => json.id)})),
// });

