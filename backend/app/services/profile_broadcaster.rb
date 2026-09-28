class ProfileBroadcaster
  def self.call(user)
    ProfileChannel.broadcast_to(user, {
      type: "profile",
      idol_points: user.idol_points,
      title: user.title,
      points_info: user.points_info,
      badges: user.badges
    })
  end
end
