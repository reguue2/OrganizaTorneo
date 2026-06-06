-- Tournament brackets: persisted, shareable game brackets (cuadros) generated
-- by the organizer once registrations are closed. One row per tournament, or
-- one row per category when the tournament has categories. The full structure
-- (rounds/groups + a snapshot of participant names) is stored as JSON so the
-- public view can render it without reading the `participants` table.

CREATE TABLE IF NOT EXISTS "public"."tournament_brackets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tournament_id" "uuid" NOT NULL,
    "category_id" "uuid",
    "format" "text" NOT NULL,
    "structure" "jsonb" NOT NULL,
    "participant_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tournament_brackets_format_check" CHECK (("format" = ANY (ARRAY['single_elimination'::"text", 'round_robin'::"text", 'groups_knockout'::"text"])))
);


ALTER TABLE "public"."tournament_brackets" OWNER TO "postgres";


ALTER TABLE ONLY "public"."tournament_brackets"
    ADD CONSTRAINT "tournament_brackets_pkey" PRIMARY KEY ("id");


ALTER TABLE ONLY "public"."tournament_brackets"
    ADD CONSTRAINT "tournament_brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE CASCADE;


ALTER TABLE ONLY "public"."tournament_brackets"
    ADD CONSTRAINT "tournament_brackets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;


CREATE UNIQUE INDEX "tournament_brackets_unique" ON "public"."tournament_brackets" USING "btree" ("tournament_id", COALESCE("category_id", '00000000-0000-0000-0000-000000000000'::"uuid"));


CREATE INDEX "tournament_brackets_tournament_id_idx" ON "public"."tournament_brackets" USING "btree" ("tournament_id");


CREATE OR REPLACE TRIGGER "set_updated_at_tournament_brackets" BEFORE UPDATE ON "public"."tournament_brackets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();


ALTER TABLE "public"."tournament_brackets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Insert own brackets" ON "public"."tournament_brackets" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "tournament_brackets"."tournament_id") AND ("tournaments"."organizer_id" = "auth"."uid"())))));


CREATE POLICY "Update own brackets" ON "public"."tournament_brackets" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "tournament_brackets"."tournament_id") AND ("tournaments"."organizer_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "tournament_brackets"."tournament_id") AND ("tournaments"."organizer_id" = "auth"."uid"())))));


CREATE POLICY "Delete own brackets" ON "public"."tournament_brackets" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "tournament_brackets"."tournament_id") AND ("tournaments"."organizer_id" = "auth"."uid"())))));


CREATE POLICY "View own brackets" ON "public"."tournament_brackets" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."tournaments"
  WHERE (("tournaments"."id" = "tournament_brackets"."tournament_id") AND ("tournaments"."organizer_id" = "auth"."uid"())))));


CREATE POLICY "Public can view brackets of visible tournaments" ON "public"."tournament_brackets" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."tournaments" "t"
  WHERE (("t"."id" = "tournament_brackets"."tournament_id") AND ("t"."status" = ANY (ARRAY['published'::"public"."tournament_status", 'closed'::"public"."tournament_status", 'finished'::"public"."tournament_status", 'cancelled'::"public"."tournament_status"]))))));


GRANT SELECT ON TABLE "public"."tournament_brackets" TO "anon";
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE "public"."tournament_brackets" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_brackets" TO "service_role";
