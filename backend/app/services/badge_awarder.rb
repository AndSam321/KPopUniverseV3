class BadgeAwarder
  FANDOM_THRESHOLD = 10

  TITLE_ICONS = {
    "Rising Star" => "✨",
    "Idol" => "🌟",
    "Superstar" => "👑"
  }.freeze

  def initialize(user)
    @user = user
  end

  def sync_title_badge
    icon = TITLE_ICONS[user.title]
    return unless icon

    award(key: "title:#{user.title.parameterize}", name: user.title, icon: icon)
  end

  def check_fandom_badges(groups)
    groups.filter_map { |group| award_fandom_badge(group) }
  end

  private

  attr_reader :user

  def award_fandom_badge(group)
    key = "fandom:#{group.id}"
    return if group.fandom_name.blank? || earned?(key)
    return unless community_activity(group) >= FANDOM_THRESHOLD

    award(key: key, name: group.fandom_name, icon: "💜", group_id: group.id)
  end

  def community_activity(group)
    posts = user.posts.joins(:community).where(communities: {group_id: group.id}).count
    comments = Comment.where(user: user).joins(post: :community).where(communities: {group_id: group.id}).count
    posts + comments
  end

  def earned?(key)
    user.badges.any? { |badge| badge["key"] == key }
  end

  def award(key:, name:, icon:, group_id: nil)
    return if earned?(key)

    badge = {"key" => key, "name" => name, "icon" => icon, "earned_at" => Time.current.iso8601}
    badge["group_id"] = group_id if group_id
    user.update!(badges: user.badges + [badge])
    badge
  end
end
