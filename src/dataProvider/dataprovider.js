import {baseUrl} from './baseUrl';
import inMemoryJWT from 'ra-in-memory-jwt';
import {fetchUtils} from 'ra-core';
import {stringify} from 'query-string';
const httpClientAuthToken = (url,options={}) => {

        options.headers = new Headers({ Accept: 'application/json' });

        const token = inMemoryJWT.getToken();

        if (token) {
        options.headers.set('Authorization', `Bearer ${token}`);
        
        options.credentials = 'include';
        options.cache = "no-cache";
        return fetchUtils.fetchJson(url, options); 
    } else {
        inMemoryJWT.setRefreshTokenEndpoint(baseUrl+'/refresh-token');
        return inMemoryJWT.getRefreshedToken().then((gotFreshToken) => {
            if (gotFreshToken) {
                options.headers.set('Authorization', `Bearer ${inMemoryJWT.getToken()}`);
            };
            
            return fetchUtils.fetchJson(url, options);
        });
    }
    };

export default (apiUrl, httpClient = httpClientAuthToken) => ({

    getList: async (resource, params) => {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            ...fetchUtils.flattenObject(params.filter),
            _sort: field,
            _order: order,
            _start: (page - 1) * perPage,
            _end: page * perPage,
        };
        //Проверка на кол-во отображаемых заявок на странице Ticket и CMDB.
        if (perPage > 100) {
            throw new Error("Ошибка запроса perPage(колличество отображаемых заявок). Максимальное число запроса perPage не может превышать 100.", 'warning')
        } else if (perPage < 10) {
            throw new Error("Ошибка запроса perPage(колличество отображаемых заявок). Минимальное число запроса perPage не может быть ниже 10.", 'warning')
        }
        //Проверка на табы в Ticket и CMDB.
        if (resource === 'Ticket') {
            if (params.filter.Tab !== '6' && params.filter.Tab !== '1' && params.filter.Tab !== '2' && params.filter.Tab !== '3' && params.filter.Tab !== '4' && params.filter.Tab !== '5') {
                throw new Error("Заданы неправильные параметры набора состояний.",'warning')
            }  
        } else if (resource === 'CMDB') {
            if (params.filter.typeConfItems !== 23 && params.filter.typeConfItems !== 26) {
                throw new Error("Заданы неправильные параметры набора состояний.",'warning')
            }
        }
              
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        if ( resource==='Ticket' ) {
            const {headers, json} = await httpClient(url);
            if (!headers.has('x-total-count')) {
                throw new Error(
                    'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
                );
            }
            const {Tickets: data, ...rest} = json;

            return {
                ...rest,
                data,
                total: parseInt(
                    headers
                        .get('x-total-count')
                        .split('/')
                        .pop(),
                    10
                ),
            };
        } else { // Стандартный мармелабовский json-server-provider
            return httpClient(url).then(({ headers, json }) => {
                if (!headers.has('x-total-count')) {
                    throw new Error(
                        'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
                    );
                }
                return {
                    data: json,
                    total: parseInt(
                        headers
                            .get('x-total-count')
                            .split('/')
                            .pop(),
                        10
                    ),
                };
            });
        }
    },

    getCounter: (resource, params) => {
        const query = {
            ...params
        };

        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({json}) => {
            const {Counters: data} = json
            return {
                data
            };
        });
    },

    getOne: (resource, params) => {
        return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({json}) => ({
            data: json,
        }))
    },


    getMany: (resource, params) => {
        const query = {
            id: params.ids,
        };
        const url = `${apiUrl}/${resource}${stringify(query)}`;
        return httpClient(url).then(({json}) => ({data: json}));
    },

    getManyReference: (resource, params) => {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            ...fetchUtils.flattenObject(params.filter),
            [params.target]: params.id,
            _sort: field,
            _order: order,
            _start: (page - 1) * perPage,
            _end: page * perPage,
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({headers, json}) => {
            if (!headers.has('x-total-count')) {
                throw new Error(
                    'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
                );
            }
            return {
                data: json,
                total: parseInt(
                    headers
                        .get('x-total-count')
                        .split('/')
                        .pop(),
                    10
                ),
            };
        });
    },

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json})),

    // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
    updateMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(params.data),
                })
            )
        ).then(responses => ({data: responses.map(({json}) => json.id)})),

    create: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({
            data: {...params.data, id: json.id},
        })),

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json})),

    // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    deleteMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                })
            )
        ).then(responses => ({data: responses.map(({json}) => json.id)})),
});
