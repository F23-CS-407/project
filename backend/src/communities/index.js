import { createCommunity, query_communities, query_users, search_single_user } from "./endpoints.js";

export default function useCommunities(app){
    //community endpoints
    app.post('/create_community', createCommunity);
    app.get('/search_communities', query_communities);
    app.get('/search_users', query_users);
    app.get('/find_user', search_single_user);

    return app;
}