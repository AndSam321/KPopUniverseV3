class Api::V1::MutedGroupsController < Api::V1::BaseController
  before_action :authenticate_user!

  def toggle
    group = Group.find(params[:id])
    muted = current_user.muted_groups.find_by(group: group)

    if muted
      muted.destroy!
      render json: {status: "success", muted: false}
    else
      current_user.muted_groups.create!(group: group)
      render json: {status: "success", muted: true}
    end
  end
end
