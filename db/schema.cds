namespace db;

using {managed} from '@sap/cds/common';


entity Request : managed {
    key RequestID : UUID @(Core.Computed: true);
}
