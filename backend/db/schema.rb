# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_07_183652) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "albums", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.string "title", null: false
    t.string "album_type"
    t.date "release_date"
    t.string "cover_url"
    t.string "external_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "spotify_id"
    t.index ["group_id", "spotify_id"], name: "index_albums_on_group_id_and_spotify_id", unique: true
    t.index ["group_id"], name: "index_albums_on_group_id"
  end

  create_table "comebacks", force: :cascade do |t|
    t.string "artist_name", null: false
    t.bigint "group_id"
    t.string "title", null: false
    t.string "title_track"
    t.string "release_type"
    t.date "comeback_date", null: false
    t.string "source_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "region"
    t.index ["comeback_date", "artist_name", "title"], name: "index_comebacks_on_date_artist_title", unique: true
    t.index ["comeback_date"], name: "index_comebacks_on_comeback_date"
    t.index ["group_id"], name: "index_comebacks_on_group_id"
  end

  create_table "comment_likes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "comment_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["comment_id"], name: "index_comment_likes_on_comment_id"
    t.index ["user_id", "comment_id"], name: "index_comment_likes_on_user_id_and_comment_id", unique: true
    t.index ["user_id"], name: "index_comment_likes_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.bigint "parent_id"
    t.text "content"
    t.integer "likes_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "image_url"
    t.bigint "reply_to_user_id"
    t.index ["parent_id", "created_at"], name: "index_comments_on_parent_id_and_created_at"
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["post_id", "created_at"], name: "index_comments_on_post_id_and_created_at"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["reply_to_user_id"], name: "index_comments_on_reply_to_user_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "communities", force: :cascade do |t|
    t.bigint "group_id"
    t.bigint "creator_id"
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.boolean "official", default: false, null: false
    t.integer "member_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_communities_on_creator_id"
    t.index ["group_id"], name: "index_communities_on_group_id"
    t.index ["slug"], name: "index_communities_on_slug", unique: true
  end

  create_table "community_memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "community_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id"], name: "index_community_memberships_on_community_id"
    t.index ["user_id", "community_id"], name: "index_community_memberships_on_user_id_and_community_id", unique: true
    t.index ["user_id"], name: "index_community_memberships_on_user_id"
  end

  create_table "conversation_participants", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.bigint "user_id", null: false
    t.datetime "last_read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id", "user_id"], name: "index_conversation_participants_on_conversation_id_and_user_id", unique: true
    t.index ["conversation_id"], name: "index_conversation_participants_on_conversation_id"
    t.index ["user_id"], name: "index_conversation_participants_on_user_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "user_one_id"
    t.bigint "user_two_id"
    t.datetime "last_message_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.boolean "group", default: false, null: false
    t.bigint "creator_id"
    t.index ["creator_id"], name: "index_conversations_on_creator_id"
    t.index ["last_message_at"], name: "index_conversations_on_last_message_at"
    t.index ["user_one_id", "user_two_id"], name: "index_conversations_on_user_one_id_and_user_two_id", unique: true
    t.index ["user_one_id"], name: "index_conversations_on_user_one_id"
    t.index ["user_two_id"], name: "index_conversations_on_user_two_id"
  end

  create_table "feedbacks", force: :cascade do |t|
    t.text "message", null: false
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_feedbacks_on_user_id"
  end

  create_table "follows", force: :cascade do |t|
    t.bigint "follower_id", null: false
    t.bigint "followed_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["followed_id"], name: "index_follows_on_followed_id"
    t.index ["follower_id", "followed_id"], name: "index_follows_on_follower_id_and_followed_id", unique: true
    t.index ["follower_id"], name: "index_follows_on_follower_id"
  end

  create_table "groups", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.string "logo_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.string "korean_name"
    t.string "company"
    t.date "debut_date"
    t.string "group_type"
    t.string "status", default: "active", null: false
    t.string "fandom_name"
    t.string "spotify_id"
    t.datetime "last_synced_at"
    t.string "sync_status", default: "pending", null: false
    t.text "sync_error"
    t.virtual "name_search", type: :string, as: "regexp_replace(lower((name)::text), '[^a-z0-9]'::text, ''::text, 'g'::text)", stored: true
    t.index ["korean_name"], name: "index_groups_on_korean_name_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["name"], name: "index_groups_on_name"
    t.index ["name"], name: "index_groups_on_name_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["name_search"], name: "index_groups_on_name_search_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["slug"], name: "index_groups_on_slug", unique: true
    t.index ["spotify_id"], name: "index_groups_on_spotify_id", unique: true
    t.index ["user_id"], name: "index_groups_on_user_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti"
    t.datetime "exp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti"
  end

  create_table "likes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_likes_on_post_id"
    t.index ["user_id", "post_id"], name: "index_likes_on_user_id_and_post_id", unique: true
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "members", force: :cascade do |t|
    t.bigint "group_id", null: false
    t.string "stage_name", null: false
    t.string "full_name"
    t.date "birth_date"
    t.string "position"
    t.string "photo_url"
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.virtual "stage_name_search", type: :string, as: "regexp_replace(lower((stage_name)::text), '[^a-z0-9]'::text, ''::text, 'g'::text)", stored: true
    t.virtual "full_name_search", type: :string, as: "regexp_replace(lower((COALESCE(full_name, ''::character varying))::text), '[^a-z0-9]'::text, ''::text, 'g'::text)", stored: true
    t.index ["full_name_search"], name: "index_members_on_full_name_search_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["group_id"], name: "index_members_on_group_id"
    t.index ["stage_name"], name: "index_members_on_stage_name_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["stage_name_search"], name: "index_members_on_stage_name_search_trgm", opclass: :gin_trgm_ops, using: :gin
  end

  create_table "message_reactions", force: :cascade do |t|
    t.bigint "message_id", null: false
    t.bigint "user_id", null: false
    t.string "emoji", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["message_id", "user_id", "emoji"], name: "index_message_reactions_on_message_id_and_user_id_and_emoji", unique: true
    t.index ["message_id"], name: "index_message_reactions_on_message_id"
    t.index ["user_id"], name: "index_message_reactions_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.bigint "sender_id", null: false
    t.text "body"
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "image_url"
    t.index ["conversation_id", "created_at"], name: "index_messages_on_conversation_id_and_created_at"
    t.index ["conversation_id", "read_at"], name: "index_messages_on_conversation_id_and_read_at"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "muted_groups", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "group_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["group_id"], name: "index_muted_groups_on_group_id"
    t.index ["user_id", "group_id"], name: "index_muted_groups_on_user_id_and_group_id", unique: true
    t.index ["user_id"], name: "index_muted_groups_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "recipient_id", null: false
    t.bigint "actor_id", null: false
    t.string "notifiable_type", null: false
    t.bigint "notifiable_id", null: false
    t.string "action", null: false
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actor_id"], name: "index_notifications_on_actor_id"
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable"
    t.index ["recipient_id", "created_at"], name: "index_notifications_on_recipient_id_and_created_at"
    t.index ["recipient_id", "read_at"], name: "index_notifications_on_recipient_id_and_read_at"
    t.index ["recipient_id"], name: "index_notifications_on_recipient_id"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "caption"
    t.bigint "user_id", null: false
    t.integer "likes_count", default: 0, null: false
    t.integer "comments_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "flair"
    t.bigint "community_id"
    t.index ["caption"], name: "index_posts_on_caption_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["community_id"], name: "index_posts_on_community_id"
    t.index ["created_at"], name: "index_posts_on_created_at"
    t.index ["title"], name: "index_posts_on_title_trgm", opclass: :gin_trgm_ops, using: :gin
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.binary "payload", null: false
    t.datetime "created_at", null: false
    t.bigint "channel_hash", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.binary "key", null: false
    t.binary "value", null: false
    t.datetime "created_at", null: false
    t.bigint "key_hash", null: false
    t.integer "byte_size", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "username", null: false
    t.string "avatar_url"
    t.text "bio"
    t.integer "idol_points", default: 0
    t.string "title", default: "Trainee"
    t.string "provider"
    t.string "uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "badges", default: []
    t.jsonb "notification_preferences", default: {"likes" => true, "replies" => true, "comments" => true}, null: false
    t.boolean "admin", default: false, null: false
    t.datetime "last_active_at"
    t.datetime "onboarded_at"
    t.index ["badges"], name: "index_users_on_badges", using: :gin
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["idol_points"], name: "index_users_on_idol_points"
    t.index ["last_active_at"], name: "index_users_on_last_active_at"
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["title"], name: "index_users_on_title"
    t.index ["username"], name: "index_users_on_username", unique: true
    t.index ["username"], name: "index_users_on_username_trgm", opclass: :gin_trgm_ops, using: :gin
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "albums", "groups"
  add_foreign_key "comebacks", "groups"
  add_foreign_key "comment_likes", "comments"
  add_foreign_key "comment_likes", "users"
  add_foreign_key "comments", "comments", column: "parent_id"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "comments", "users", column: "reply_to_user_id"
  add_foreign_key "communities", "groups"
  add_foreign_key "communities", "users", column: "creator_id"
  add_foreign_key "community_memberships", "communities"
  add_foreign_key "community_memberships", "users"
  add_foreign_key "conversation_participants", "conversations"
  add_foreign_key "conversation_participants", "users"
  add_foreign_key "conversations", "users", column: "creator_id"
  add_foreign_key "conversations", "users", column: "user_one_id"
  add_foreign_key "conversations", "users", column: "user_two_id"
  add_foreign_key "feedbacks", "users"
  add_foreign_key "follows", "users", column: "followed_id"
  add_foreign_key "follows", "users", column: "follower_id"
  add_foreign_key "groups", "users"
  add_foreign_key "likes", "posts"
  add_foreign_key "likes", "users"
  add_foreign_key "members", "groups"
  add_foreign_key "message_reactions", "messages"
  add_foreign_key "message_reactions", "users"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "muted_groups", "groups"
  add_foreign_key "muted_groups", "users"
  add_foreign_key "notifications", "users", column: "actor_id"
  add_foreign_key "notifications", "users", column: "recipient_id"
  add_foreign_key "posts", "communities"
  add_foreign_key "posts", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
end
