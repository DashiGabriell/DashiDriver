# RLS Policies - LocaDashi (DashiDrive)

Este arquivo contém apenas as políticas RLS filtradas do banco de dados compartilhado, referente exclusivamente às tabelas `carcontrol_` do projeto LocaDashi1.

| Tabela | Política | Tipo | Roles | Permissive | USING | WITH CHECK |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| carcontrol_alerts | Users can manage their own alerts | ALL | authenticated | PERMISSIVE | (auth.uid() = user_id) | NULL |
| carcontrol_checklist_images | checklist_images_company_delete | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_checklist_images | checklist_images_company_insert | INSERT | authenticated | PERMISSIVE | NULL | (company_id = get_user_company_id()) |
| carcontrol_checklist_images | checklist_images_company_read | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_checklist_images | checklist_images_company_update | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | (company_id = get_user_company_id()) |
| carcontrol_checklists | checklists_company_delete | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_checklists | checklists_company_insert | INSERT | authenticated | PERMISSIVE | NULL | ((company_id = get_user_company_id()) AND (user_id = auth.uid())) |
| carcontrol_checklists | checklists_company_read | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_checklists | checklists_company_update | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | (company_id = get_user_company_id()) |
| carcontrol_checklists | checklists_delete_own_company | DELETE | authenticated | PERMISSIVE | (company_id = ( SELECT carcontrol_profiles.company_id FROM carcontrol_profiles WHERE (carcontrol_profiles.id = auth.uid()))) | NULL |
| carcontrol_checklists | checklists_insert_authenticated | INSERT | authenticated | PERMISSIVE | NULL | true |
| carcontrol_checklists | checklists_select_own_company | SELECT | authenticated | PERMISSIVE | (company_id = ( SELECT carcontrol_profiles.company_id FROM carcontrol_profiles WHERE (carcontrol_profiles.id = auth.uid()))) | NULL |
| carcontrol_checklists | checklists_update_own_company | UPDATE | authenticated | PERMISSIVE | (company_id = ( SELECT carcontrol_profiles.company_id FROM carcontrol_profiles WHERE (carcontrol_profiles.id = auth.uid()))) | (company_id = ( SELECT carcontrol_profiles.company_id FROM carcontrol_profiles WHERE (carcontrol_profiles.id = auth.uid()))) |
| carcontrol_companies | companies_delete_dev | DELETE | authenticated | PERMISSIVE | ((id = get_user_company_id()) AND (EXISTS ( SELECT 1 FROM carcontrol_profiles WHERE ((carcontrol_profiles.id = auth.uid()) AND (carcontrol_profiles.role = 'dev'::text))))) | NULL |
| carcontrol_companies | companies_insert_authenticated | INSERT | authenticated | PERMISSIVE | NULL | true |
| carcontrol_companies | companies_select_own | SELECT | authenticated | PERMISSIVE | ((id = get_user_company_id()) OR (get_user_company_id() IS NULL)) | NULL |
| carcontrol_companies | companies_update_admin | UPDATE | authenticated | PERMISSIVE | ((id = get_user_company_id()) AND (EXISTS ( SELECT 1 FROM carcontrol_profiles WHERE ((carcontrol_profiles.id = auth.uid()) AND (carcontrol_profiles.role = ANY (ARRAY['admin'::text, 'dev'::text])))))) | ((id = get_user_company_id()) AND (EXISTS ( SELECT 1 FROM carcontrol_profiles WHERE ((carcontrol_profiles.id = auth.uid()) AND (carcontrol_profiles.role = ANY (ARRAY['admin'::text, 'dev'::text])))))) |
| carcontrol_drivers | Users can manage their own drivers | ALL | authenticated | PERMISSIVE | (auth.uid() = user_id) | NULL |
| carcontrol_drivers | drivers_company_delete | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_drivers | drivers_company_insert | INSERT | authenticated | PERMISSIVE | NULL | (company_id = get_user_company_id()) |
| carcontrol_drivers | drivers_company_read | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_drivers | drivers_company_update | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | (company_id = get_user_company_id()) |
| carcontrol_drivers | drivers_delete_company | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_drivers | drivers_insert_company | INSERT | authenticated | PERMISSIVE | NULL | (company_id = get_user_company_id()) |
| carcontrol_drivers | drivers_select_company | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_drivers | drivers_update_company | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_maintenances | Users can delete own maintenances | DELETE | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_maintenances | Users can insert own maintenances | INSERT | authenticated | PERMISSIVE | NULL | (user_id = auth.uid()) |
| carcontrol_maintenances | Users can manage their own maintenances | ALL | authenticated | PERMISSIVE | (auth.uid() = user_id) | NULL |
| carcontrol_maintenances | Users can update own maintenances | UPDATE | authenticated | PERMISSIVE | (user_id = auth.uid()) | (user_id = auth.uid()) |
| carcontrol_maintenances | Users can view own maintenances | SELECT | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_parcela_seguro_payments | Users can delete their own parcela_seguro_payments | DELETE | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_parcela_seguro_payments | Users can insert their own parcela_seguro_payments | INSERT | authenticated | PERMISSIVE | NULL | (user_id = auth.uid()) |
| carcontrol_parcela_seguro_payments | Users can update their own parcela_seguro_payments | UPDATE | authenticated | PERMISSIVE | (user_id = auth.uid()) | (user_id = auth.uid()) |
| carcontrol_parcela_seguro_payments | Users can view their own parcela_seguro_payments | SELECT | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_parcela_seguro_schedules | parcela_seguro_schedules_delete_own | DELETE | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_parcela_seguro_schedules | parcela_seguro_schedules_insert_own | INSERT | authenticated | PERMISSIVE | NULL | (user_id = auth.uid()) |
| carcontrol_parcela_seguro_schedules | parcela_seguro_schedules_select_own | SELECT | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_parcela_seguro_schedules | parcela_seguro_schedules_update_own | UPDATE | authenticated | PERMISSIVE | (user_id = auth.uid()) | (user_id = auth.uid()) |
| carcontrol_payment_schedules | schedules_delete_own | DELETE | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_payment_schedules | schedules_insert_own | INSERT | authenticated | PERMISSIVE | NULL | (user_id = auth.uid()) |
| carcontrol_payment_schedules | schedules_select_own | SELECT | authenticated | PERMISSIVE | (user_id = auth.uid()) | NULL |
| carcontrol_payment_schedules | schedules_update_own | UPDATE | authenticated | PERMISSIVE | (user_id = auth.uid()) | (user_id = auth.uid()) |
| carcontrol_payments | Users can manage their own payments | ALL | authenticated | PERMISSIVE | (auth.uid() = user_id) | NULL |
| carcontrol_payments | payments_delete_company | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_payments | payments_insert_company | INSERT | authenticated | PERMISSIVE | NULL | (company_id = get_user_company_id()) |
| carcontrol_payments | payments_select_company | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_payments | payments_update_company | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_profiles | profiles_insert_own | INSERT | authenticated | PERMISSIVE | NULL | (id = auth.uid()) |
| carcontrol_profiles | profiles_select_company | SELECT | authenticated | PERMISSIVE | ((id = auth.uid()) OR ((company_id IS NOT NULL) AND (company_id = get_user_company_id()))) | NULL |
| carcontrol_profiles | profiles_update_admin | UPDATE | authenticated | PERMISSIVE | ((company_id IS NOT NULL) AND (company_id = get_user_company_id()) AND (EXISTS ( SELECT 1 FROM carcontrol_profiles p WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::text, 'dev'::text])))))) | ((company_id IS NOT NULL) AND (company_id = get_user_company_id()) AND (EXISTS ( SELECT 1 FROM carcontrol_profiles p WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::text, 'dev'::text])))))) |
| carcontrol_profiles | profiles_update_own | UPDATE | authenticated | PERMISSIVE | (id = auth.uid()) | (id = auth.uid()) |
| carcontrol_vehicles | Users can manage their own vehicles | ALL | authenticated | PERMISSIVE | (auth.uid() = user_id) | NULL |
| carcontrol_vehicles | vehicles_company_delete | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_vehicles | vehicles_company_insert | INSERT | authenticated | PERMISSIVE | NULL | (company_id = get_user_company_id()) |
| carcontrol_vehicles | vehicles_company_read | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_vehicles | vehicles_company_update | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | (company_id = get_user_company_id()) |
| carcontrol_vehicles | vehicles_delete_company | DELETE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_vehicles | vehicles_insert_company | INSERT | authenticated | PERMISSIVE | NULL | (company_id = get_user_company_id()) |
| carcontrol_vehicles | vehicles_select_company | SELECT | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
| carcontrol_vehicles | vehicles_update_company | UPDATE | authenticated | PERMISSIVE | (company_id = get_user_company_id()) | NULL |
