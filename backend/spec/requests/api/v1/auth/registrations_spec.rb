require 'rails_helper'

RSpec.describe "POST /api/v1/auth (Signup)", type: :request do
  let(:valid_attributes) do
    {
      user: {
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
        username: "newuser"
      }
    }
  end

  let(:headers) do
    {
      "Content-Type" => "application/json",
      "Accept" => "application/json"
    }
  end

  describe "successful signup" do
    it "creates a new user and returns JWT token" do
      expect {
        post "/api/v1/auth", params: valid_attributes.to_json, headers: headers
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response["success"]).to be true
      expect(json_response["message"]).to eq("Signed up successfully")
      expect(json_response["data"]["user"]["email"]).to eq("newuser@example.com")
      expect(json_response["data"]["user"]["username"]).to eq("newuser")
      expect(json_response["data"]["user"]["title"]).to eq("Trainee")
      expect(json_response["data"]["user"]["idol_points"]).to eq(0)
      expect(json_response["data"]["token"]).to be_present
    end

    it "does not expose sensitive user data" do
      post "/api/v1/auth", params: valid_attributes.to_json, headers: headers

      expect(json_response["data"]["user"]).not_to have_key("password")
      expect(json_response["data"]["user"]).not_to have_key("encrypted_password")
    end
  end

  describe "failed signup" do
    it "returns error when email is missing" do
      invalid_params = valid_attributes.deep_dup
      invalid_params[:user][:email] = ""

      post "/api/v1/auth", params: invalid_params.to_json, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response["success"]).to be false
      expect(json_response["errors"]).to include("Email can't be blank")
    end

    it "returns error when username is missing" do
      invalid_params = valid_attributes.deep_dup
      invalid_params[:user][:username] = ""

      post "/api/v1/auth", params: invalid_params.to_json, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response["success"]).to be false
      expect(json_response["errors"]).to include("Username can't be blank")
    end

    it "returns error when password is too short" do
      invalid_params = valid_attributes.deep_dup
      invalid_params[:user][:password] = "123"

      post "/api/v1/auth", params: invalid_params.to_json, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response["success"]).to be false
    end

    it "returns error when email is already taken" do
      create(:user, email: "newuser@example.com")

      post "/api/v1/auth", params: valid_attributes.to_json, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response["errors"]).to include("Email has already been taken")
    end

    it "returns error when username is already taken" do
      create(:user, username: "newuser")

      post "/api/v1/auth", params: valid_attributes.to_json, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response["errors"]).to include("Username has already been taken")
    end
  end
end
