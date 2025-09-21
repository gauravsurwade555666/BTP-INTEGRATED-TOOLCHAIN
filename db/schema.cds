namespace db;

using {
    managed,
    cuid
} from '@sap/cds/common';


entity Request : managed {
    key RequestID : UUID @(Core.Computed: true);
        URL       : String;
}
