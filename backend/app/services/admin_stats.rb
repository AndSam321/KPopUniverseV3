class AdminStats
  DAYS = 14

  def call
    {
      totals: totals,
      active_users: active_users,
      signups_by_day: series(User),
      recent_users: recent_users,
      posts_by_day: series(Post),
      top_groups: top_groups,
      top_posters: top_posters,
      feedback: recent_feedback,
      group_sync: group_sync
    }
  end

  private

  def totals
    {
      users: User.count,
      posts: Post.count,
      comments: Comment.count,
      communities: Community.count,
      likes: Like.count
    }
  end

  def active_users
    {
      day: active_since(1.day.ago),
      week: active_since(7.days.ago),
      month: active_since(30.days.ago)
    }
  end

  def active_since(time)
    User.where("last_active_at > ?", time).count
  end

  def series(model)
    counts = model.where("created_at >= ?", (DAYS - 1).days.ago.beginning_of_day)
      .group(Arel.sql("DATE(created_at)")).count
    (0...DAYS).map do |offset|
      date = (DAYS - 1 - offset).days.ago.to_date
      {date: date.iso8601, count: counts[date] || 0}
    end
  end

  def recent_users
    User.with_attached_avatar.order(created_at: :desc).limit(8).map do |user|
      {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.profile_avatar_url,
        created_at: user.created_at.iso8601
      }
    end
  end

  def top_groups
    Group.left_joins(communities: :posts)
      .group("groups.id", "groups.name")
      .order(Arel.sql("COUNT(posts.id) DESC"))
      .limit(6)
      .pluck("groups.name", Arel.sql("COUNT(posts.id)"))
      .map { |name, count| {name: name, count: count} }
  end

  def group_sync
    album_counts = Album.group(:group_id).count
    Group.order(:name).map do |group|
      {
        id: group.id,
        name: group.name,
        status: group.sync_status,
        last_synced_at: group.last_synced_at&.iso8601,
        error: group.sync_error,
        albums: album_counts[group.id] || 0
      }
    end
  end

  def recent_feedback
    Feedback.includes(:user).order(created_at: :desc).limit(30).map do |fb|
      {
        id: fb.id,
        message: fb.message,
        username: fb.user&.username || "Guest",
        created_at: fb.created_at.iso8601
      }
    end
  end

  def top_posters
    Post.joins(:user)
      .group("users.id", "users.username")
      .order(Arel.sql("COUNT(posts.id) DESC"))
      .limit(6)
      .pluck("users.username", Arel.sql("COUNT(posts.id)"))
      .map { |username, count| {username: username, count: count} }
  end
end
