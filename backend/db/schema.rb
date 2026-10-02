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

ActiveRecord::Schema[8.0].define(version: 2026_10_02_031933) do
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
    t.bigint "group_id", null: false
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
    t.index ["badges"], name: "index_users_on_badges", using: :gin
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["idol_points"], name: "index_users_on_idol_points"
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
  add_foreign_key "follows", "users", column: "followed_id"
  add_foreign_key "follows", "users", column: "follower_id"
  add_foreign_key "groups", "users"
  add_foreign_key "likes", "posts"
  add_foreign_key "likes", "users"
  add_foreign_key "members", "groups"
  add_foreign_key "muted_groups", "groups"
  add_foreign_key "muted_groups", "users"
  add_foreign_key "notifications", "users", column: "actor_id"
  add_foreign_key "notifications", "users", column: "recipient_id"
  add_foreign_key "posts", "communities"
  add_foreign_key "posts", "users"
end
