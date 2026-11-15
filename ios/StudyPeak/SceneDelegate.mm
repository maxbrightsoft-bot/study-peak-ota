#import "SceneDelegate.h"
#import <React/RCTLinkingManager.h>

@implementation SceneDelegate

// MARK: - UIWindowSceneDelegate lifecycle

/// Called when iOS connects a scene to the app.
/// For React Native + Expo, the UIWindow is already created by RCTAppDelegate
/// (via EXAppDelegateWrapper) in application:didFinishLaunchingWithOptions:.
/// We must NOT create a new window here — instead, we adopt the existing one
/// by transferring it to this windowScene.
- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) return;

  UIWindowScene *windowScene = (UIWindowScene *)scene;

  // Retrieve the shared AppDelegate (which owns the RN window)
  UIApplication *app = [UIApplication sharedApplication];
  id<UIApplicationDelegate> appDelegate = app.delegate;

  // Transfer the existing window to this scene instead of creating a new one.
  // This keeps BootSplash, React root view, and all native UI intact.
  if ([appDelegate respondsToSelector:@selector(window)]) {
    UIWindow *existingWindow = [(id)appDelegate window];
    if (existingWindow) {
      existingWindow.windowScene = windowScene;
      self.window = existingWindow;
      [self.window makeKeyAndVisible];
      return;
    }
  }

  // Fallback: should not reach here in normal operation,
  // but guard against nil window edge case.
  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];
  [self.window makeKeyAndVisible];
}

- (void)sceneDidDisconnect:(UIScene *)scene {}
- (void)sceneDidBecomeActive:(UIScene *)scene {}
- (void)sceneWillResignActive:(UIScene *)scene {}
- (void)sceneWillEnterForeground:(UIScene *)scene {}
- (void)sceneDidEnterBackground:(UIScene *)scene {}

// MARK: - Deep link / Universal link forwarding

/// Forward URL opens from Scene to RCTLinkingManager
- (void)scene:(UIScene *)scene
    openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  UIOpenURLContext *urlContext = URLContexts.allObjects.firstObject;
  if (urlContext) {
    [RCTLinkingManager
        application:[UIApplication sharedApplication]
            openURL:urlContext.URL
            options:@{}];
  }
}

/// Forward Universal Links / NSUserActivity from Scene to RCTLinkingManager
- (void)scene:(UIScene *)scene
    continueUserActivity:(NSUserActivity *)userActivity
{
  [RCTLinkingManager
      application:[UIApplication sharedApplication]
      continueUserActivity:userActivity
      restorationHandler:^(NSArray<id<UIUserActivityRestoring>> *_Nullable r) {}];
}

@end
