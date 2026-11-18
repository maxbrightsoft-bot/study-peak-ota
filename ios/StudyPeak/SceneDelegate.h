#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/// A dedicated UIWindowSceneDelegate that handles the iOS Scene lifecycle.
/// Required for iOS 27+ which enforces UIScene-based app lifecycle.
/// This class works alongside EXAppDelegateWrapper/RCTAppDelegate without
/// conflicting with their UIWindow initialization in didFinishLaunchingWithOptions.
@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>

@property (strong, nonatomic) UIWindow *window;

@end

NS_ASSUME_NONNULL_END

