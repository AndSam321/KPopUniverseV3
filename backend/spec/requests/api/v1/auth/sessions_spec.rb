require 'rails_helper'

RSpec.describe "Sessions API", type: :request do
  let!(:user) { create(:user) }

  describe "POST /api/v1/auth/sign_in (Login)" do
    context "with invalid credentials" do
      it "returns error with wrong password" do
        post "/api/v1/auth/sign_in", params: {
          user: {
            email: user.email,
            password: "wrongpassword"
          }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns error with non-existent email" do
        post "/api/v1/auth/sign_in", params: {
          user: {
            email: "nonexistent@example.com",
            password: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns error with missing email" do
        post "/api/v1/auth/sign_in", params: {
          user: {
            email: "",
            password: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns error with missing password" do
        post "/api/v1/auth/sign_in", params: {
          user: {
            email: user.email,
            password: ""
          }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
