FactoryGirl.define do
  factory :issue do
    sequence(:description) {|count| "Sample Description #{ count }" }
    sequence(:subject) {|count| "Sample Subject #{ count }" }
    created_on 3.days.ago.to_s(:db)
    due_date 10.day.from_now.to_date.to_s(:db)
    start_date 1.day.ago.to_date.to_s(:db)
    updated_on 1.day.ago.to_s(:db)
  end
end
