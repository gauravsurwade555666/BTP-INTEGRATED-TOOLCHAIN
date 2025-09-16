using {db as my} from '../db/schema';

service CapDMS @(requires: 'authenticated-user') {
    entity RequestSet as projection on my.Request;
}