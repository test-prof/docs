# FactoryAllStub

_Factory All Stub_ は、(`create` や `build` を呼び出した場合でも) FactoryBot に `build_stubbed` ストラテジーだけを使わせる呪文です。

その背景にある考えは、[Factory Doctor](../profilers/factory_doctor.md) が検出した違反を素早く修正する (さらには自動で修正する) ことです。

**注意**. FactoryBot でのみ動作します。あくまで spec の一時的な修正として考えてください。

## 使い方

まず、`FactoryAllStub` を初期化する必要があります。

```ruby
TestProf::FactoryAllStub.init
```

この初期化処理は、FactoryBot のジェネレータに独自のロジックを注入します。

_all-stub_ モードを有効にするには次のようにします。

```ruby
TestProf::FactoryAllStub.enable!
```

_all-stub_ モードを無効にして、いつもどおりファクトリを使うには次のようにします。

```ruby
TestProf::FactoryAllStub.disable!
```

## RSpec

`spec_helper.rb` (`rails_helper.rb` がある場合はそちら) に次の記述を追加してください。

```ruby
require "test_prof/recipes/rspec/factory_all_stub"
```

これにより `FactoryAllStub` が自動的に初期化され (`.init` を呼び出す必要はありません)、
印を付けた example や example group でこのモードを有効にする `"factory:stub"` shared context が提供されます。

```ruby
describe "User" do
  let(:user) { create(:user) }

  it "is valid", factory: :stub do
    # `create` の代わりに `build_stubbed` を使う
    expect(user).to be_valid
  end
end
```

`FactoryAllStub` は、次のように `FactoryDoctor` と組み合わせて使うことを想定して設計されています。

```sh
# FactoryDoctor を実行し、違反しているすべての example に factory:stub の印を付ける
FDOC=1 FDOC_STAMP=factory:stub rspec ./spec/models
```
