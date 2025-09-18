namespace db;

using {managed,cuid} from '@sap/cds/common';
using { Attachments } from '@cap-js/sdm';

entity Request : managed {
    key RequestID :UUID    @(Core.Computed: true)   ;
    myAttachments : Composition of many Attachments;
}

