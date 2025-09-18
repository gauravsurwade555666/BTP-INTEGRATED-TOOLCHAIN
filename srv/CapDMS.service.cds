using {db as my} from '../db/schema';

service CapDMS @(requires: 'authenticated-user') {
    @Capabilities.Insertable: true 
    @Capabilities.Updatable : true
    @Capabilities.Deletable : true
    @odata.draft.enabled
    entity RequestSet as projection on my.Request;
}
