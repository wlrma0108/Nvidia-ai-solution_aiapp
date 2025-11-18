import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  AppState,
  Linking,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, spacing, borderRadius, typography, shadows} from '../styles/theme';
import {analyzeFoodImage} from '../services/api';

const CameraScreen = ({navigation}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const appState = useRef(AppState.currentState);
  const analysisTimeoutRef = useRef(null);

  useEffect(() => {
    requestCameraPermission();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      clearAnalysisTimeout();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsCameraActive(true);
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsCameraActive(false);
      clearAnalysisTimeout();
    });

    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  const handleAppStateChange = useCallback((nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      setIsCameraActive(true);
    } else if (nextAppState.match(/inactive|background/)) {
      setIsCameraActive(false);
      clearAnalysisTimeout();
    }
    appState.current = nextAppState;
  }, []);

  const clearAnalysisTimeout = () => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }
  };

  const requestCameraPermission = async () => {
    try {
      console.log('[Camera] Requesting camera permission...');
      const currentPermission = await Camera.getCameraPermissionStatus();
      console.log('[Camera] Current permission status:', currentPermission);

      if (currentPermission === 'authorized') {
        setHasPermission(true);
        return;
      }

      const permission = await Camera.requestCameraPermission();
      console.log('[Camera] Permission request result:', permission);
      setHasPermission(permission === 'authorized');

      if (permission === 'denied' || permission === 'restricted') {
        Alert.alert(
          '카메라 권한 필요',
          '음식 분석을 위해 카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
          [
            {text: '나중에', style: 'cancel'},
            {
              text: '설정으로 이동',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('[Camera] Permission error:', error);
      Alert.alert(
        '카메라 초기화 오류',
        '카메라 권한 요청 중 오류가 발생했습니다.\n\n' +
        '가능한 해결 방법:\n' +
        '1. 앱을 완전히 종료 후 재시작\n' +
        '2. 기기 설정에서 카메라 권한 확인\n' +
        '3. 앱 재설치',
        [
          {text: '확인'},
        ]
      );
    }
  };

  const takePhoto = async () => {
    if (!camera.current || isAnalyzing) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setRetryCount(0);

      analysisTimeoutRef.current = setTimeout(() => {
        if (isAnalyzing) {
          setIsAnalyzing(false);
          Alert.alert(
            '시간 초과',
            '분석 시간이 너무 오래 걸립니다. 다시 시도해주세요.',
            [
              {text: '확인', onPress: () => clearAnalysisTimeout()},
            ]
          );
        }
      }, 60000);

      const photo = await camera.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
        skipMetadata: true,
      });

      if (!photo || !photo.path) {
        throw new Error('사진 촬영에 실패했습니다.');
      }

      const imageUri = Platform.OS === 'ios' ? photo.path : `file://${photo.path}`;
      const result = await analyzeFoodImage(imageUri);

      clearAnalysisTimeout();
      setIsAnalyzing(false);
      navigation.navigate('Result', {result, imageUri});
    } catch (error) {
      clearAnalysisTimeout();
      setIsAnalyzing(false);
      handlePhotoError(error);
    }
  };

  const handlePhotoError = (error) => {
    console.error('Photo capture error:', error);

    const errorMessage = error.message || '분석 중 오류가 발생했습니다.';

    if (retryCount < 2) {
      Alert.alert(
        '오류',
        `${errorMessage}\n\n다시 시도하시겠습니까?`,
        [
          {text: '취소', style: 'cancel'},
          {
            text: '재시도',
            onPress: () => {
              setRetryCount(prev => prev + 1);
              setTimeout(() => takePhoto(), 500);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '오류',
        `${errorMessage}\n\n계속 문제가 발생하면 앱을 재시작해주세요.`,
        [
          {text: '홈으로', onPress: () => navigation.goBack()},
          {text: '확인', style: 'cancel'},
        ]
      );
      setRetryCount(0);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-off" size={80} color={colors.textLight} />
        <Text style={styles.permissionText}>
          카메라 권한이 필요합니다
        </Text>
        <Text style={styles.permissionSubtext}>
          음식을 촬영하여 분석하기 위해{'\n'}
          카메라 접근 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>카메라 로딩 중...</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isCameraActive && !isAnalyzing}
        photo={true}
        enableZoomGesture={true}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.guideText}>
            음식이나 음료를 화면 중앙에 맞춰주세요
          </Text>
          <Text style={styles.guideSubtext}>
            음료는 영양 성분표가 보이도록 촬영하세요
          </Text>
        </View>

        <View style={styles.centerOverlay}>
          <View style={styles.focusFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        <View style={styles.bottomOverlay}>
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.analyzingText}>분석 중...</Text>
              <Text style={styles.analyzingSubtext}>
                잠시만 기다려주세요
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePhoto}
                activeOpacity={0.8}
                disabled={isAnalyzing}>
                <View style={styles.captureButtonInner}>
                  <Icon name="camera" size={40} color={colors.primary} />
                </View>
              </TouchableOpacity>
              <Text style={styles.captureHint}>탭하여 촬영</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  permissionText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  permissionButtonText: {
    ...typography.body1,
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.body2,
    color: '#FFF',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  guideText: {
    ...typography.body1,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  guideSubtext: {
    ...typography.body2,
    color: '#FFF',
    textAlign: 'center',
    marginTop: spacing.xs,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  centerOverlay: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1.2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  captureHint: {
    ...typography.body2,
    color: '#FFF',
    marginTop: spacing.sm,
    opacity: 0.8,
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  analyzingText: {
    ...typography.h3,
    color: '#FFF',
    marginTop: spacing.md,
  },
  analyzingSubtext: {
    ...typography.body2,
    color: '#FFF',
    marginTop: spacing.xs,
    opacity: 0.8,
  },
});

export default CameraScreen;
