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
    return Group.none unless valid?
    Group.search(@term)
  end

  def members
    return Member.none unless valid?
    Member.search(@term).includes(:group)
  end

  def users
    return User.none unless valid?
    User.search(@term)
  end

  def posts
    return Post.none unless valid?
    Post.search(@term).includes(:user, :groups)
  end
end
