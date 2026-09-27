class SearchQuery
  MIN_LENGTH = 2
  PREVIEW_LIMIT = 5

  def initialize(term)
    @term = term.to_s.strip
  end

  def valid?
    @term.length >= MIN_LENGTH
  end

  def groups
    fuzzy(Group.all, %w[groups.name groups.korean_name])
  end

  def members
    fuzzy(Member.includes(:group), %w[members.stage_name])
  end

  def users
    fuzzy(User.all, %w[users.username])
  end

  def posts
    fuzzy(Post.includes(:user, :groups), %w[posts.title posts.caption])
  end

  def preview
    {
      groups: groups.limit(PREVIEW_LIMIT),
      members: members.limit(PREVIEW_LIMIT),
      users: users.limit(PREVIEW_LIMIT),
      posts: posts.limit(PREVIEW_LIMIT)
    }
  end

  private

  # Matches substrings (ILIKE, index-backed by pg_trgm) OR fuzzy trigram
  # similarity (the % operator, for typos), ranked by best similarity with a
  # prefix-match boost.
  def fuzzy(scope, columns)
    return scope.none unless valid?

    like = connection.quote("%#{escape_like(@term)}%")
    prefix = connection.quote("#{escape_like(@term)}%")
    term = connection.quote(@term)

    cols = columns.map { |c| "COALESCE(#{c}::text, '')" }
    matches = cols.map { |c| "#{c} ILIKE #{like} OR #{c} % #{term}" }.join(" OR ")
    starts_with = cols.map { |c| "#{c} ILIKE #{prefix}" }.join(" OR ")
    similarity = cols.map { |c| "similarity(#{c}, #{term})" }.join(", ")

    scope
      .where(Arel.sql(matches))
      .order(Arel.sql("(#{starts_with}) DESC"))
      .order(Arel.sql("GREATEST(#{similarity}) DESC"))
      .order(id: :desc)
  end

  def escape_like(term)
    term.gsub(/[\\%_]/) { |char| "\\#{char}" }
  end

  def connection
    ActiveRecord::Base.connection
  end
end
