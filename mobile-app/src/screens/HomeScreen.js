import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, spacing, borderRadius, typography, shadows} from '../styles/theme';
import {checkServerStatus} from '../services/api';

const HomeScreen = ({navigation}) => {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const status = await checkServerStatus();
      setServerStatus(status.status === 'healthy' ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const handleStartAnalysis = () => {
    if (serverStatus === 'offline') {
      alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    navigation.navigate('Camera');
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}>
        <Icon name="food-apple" size={80} color="#FFF" />
        <Text style={styles.headerTitle}>당뇨 케어</Text>
        <Text style={styles.headerSubtitle}>음식 건강 영향 분석</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* 서버 상태 */}
        <View style={styles.statusContainer}>
          <Icon
            name={
              serverStatus === 'online'
                ? 'check-circle'
                : serverStatus === 'offline'
                ? 'close-circle'
                : 'loading'
            }
            size={20}
            color={
              serverStatus === 'online'
                ? colors.success
                : serverStatus === 'offline'
                ? colors.danger
                : colors.textSecondary
            }
          />
          <Text style={styles.statusText}>
            서버 상태:{' '}
            {serverStatus === 'online'
              ? '정상'
              : serverStatus === 'offline'
              ? '오프라인'
              : '확인 중...'}
          </Text>
        </View>

        {/* 기능 설명 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>이 앱의 기능</Text>

          <FeatureItem
            icon="camera"
            title="실시간 음식 감지"
            description="카메라로 음식을 촬영하면 AI가 자동으로 인식합니다"
          />

          <FeatureItem
            icon="text-recognition"
            title="영양 성분 분석"
            description="음료 라벨의 영양 성분표를 OCR로 읽어 분석합니다"
          />

          <FeatureItem
            icon="alert-circle"
            title="당뇨 위험도 평가"
            description="감지된 음식의 당뇨 위험도를 실시간으로 알려줍니다"
          />

          <FeatureItem
            icon="food"
            title="칼로리 추정"
            description="음식의 크기를 측정하여 대략적인 칼로리를 계산합니다"
          />
        </View>

        {/* 분석 시작 버튼 */}
        <TouchableOpacity
          style={[
            styles.startButton,
            serverStatus === 'offline' && styles.startButtonDisabled,
          ]}
          onPress={handleStartAnalysis}
          disabled={serverStatus === 'offline'}>
          <LinearGradient
            colors={
              serverStatus === 'offline'
                ? [colors.textLight, colors.textLight]
                : [colors.primary, colors.accent]
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.startButtonGradient}>
            <Icon name="camera" size={28} color="#FFF" />
            <Text style={styles.startButtonText}>촬영 시작</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 사용 가이드 */}
        <View style={[styles.card, styles.guideCard]}>
          <Text style={styles.cardTitle}>사용 방법</Text>
          <Text style={styles.guideText}>
            1. '촬영 시작' 버튼을 눌러주세요{'\n'}
            2. 카메라로 음식이나 음료를 찍어주세요{'\n'}
            3. 분석 결과를 확인하세요{'\n'}
            {'\n'}
            💡 음료의 경우 영양 성분표가 잘 보이도록 촬영하면 더 정확한 분석이 가능합니다.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const FeatureItem = ({icon, title, description}) => (
  <View style={styles.featureItem}>
    <Icon name={icon} size={32} color={colors.primary} />
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.xxl * 1.5,
  },
  headerTitle: {
    ...typography.h1,
    color: '#FFF',
    marginTop: spacing.md,
  },
  headerSubtitle: {
    ...typography.body1,
    color: '#FFF',
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  featureContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  featureTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginVertical: spacing.lg,
    ...shadows.medium,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  startButtonText: {
    ...typography.h3,
    color: '#FFF',
    marginLeft: spacing.sm,
  },
  guideCard: {
    backgroundColor: colors.primaryLight + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  guideText: {
    ...typography.body1,
    color: colors.textPrimary,
    lineHeight: 24,
  },
});

export default HomeScreen;
