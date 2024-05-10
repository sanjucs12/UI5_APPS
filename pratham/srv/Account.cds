using Pratham from '../db/schema';

service Account {
    // @odata.draft.enabled
    // entity Departments as projection on Pratham.Department;
    entity deptviews as projection on Pratham.DepartmentView;

}
