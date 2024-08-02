// using {documents as db} from '../db/data-model';

// service CatalogService @(path: '/CatalogService') {

//     entity Document as projection on db.Files
// }


using { cuid, managed } from '@sap/cds/common';
service CatalogService {
    entity TEST_Entity {
        key ID: UUID;
        testString: String;
    }
    function testFunction() returns String;
}

