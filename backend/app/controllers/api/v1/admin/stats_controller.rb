module Api
  module V1
    module Admin
      class StatsController < Api::V1::BaseController
        before_action :authenticate_user!
        before_action :require_admin

        def index
          render json: AdminStats.new.call
        end

        private

        def require_admin
          return if @current_user&.admin?

          render json: {error: "Forbidden"}, status: :forbidden
        end
      end
    end
  end
end
