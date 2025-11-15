import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {colors, spacing, borderRadius, typography, shadows} from '../styles/theme';

const ResultScreen = ({route, navigation}) => {
  const {result, imageUri} = route.params;

  // 위험도에 따른 색상 결정
  const getRiskColor = () => {
    if (!result.detected) return colors.textSecondary;

    const foodType = result.food_class;
    // 0: Banana (위험), 1: Watermelon (위험), 2: Drink (경고)
    if (foodType === 0 || foodType === 1) {
      return colors.danger;
    } else if (foodType === 2) {
      return colors.warning;
    }
    return colors.success;
  };

  const getRiskIcon = () => {
    if (!result.detected) return 'help-circle';

    const foodType = result.food_class;
    if (foodType === 0 || foodType === 1) {
      return 'alert-circle';
    } else if (foodType === 2) {
      return 'information';
    }
    return 'check-circle';
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 촬영된 이미지 */}
      <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        {result.detected ? (
          <>
            {/* 감지된 음식 카드 */}
            <View style={[styles.card, styles.foodCard]}>
              <LinearGradient
                colors={[getRiskColor(), getRiskColor() + 'DD']}
                style={styles.foodCardGradient}>
                <Icon name={getRiskIcon()} size={48} color="#FFF" />
                <Text style={styles.foodType}>{result.food_type}</Text>
                <Text style={styles.confidence}>
                  신뢰도: {(result.confidence * 100).toFixed(1)}%
                </Text>
              </LinearGradient>
            </View>

            {/* 위험도 평가 카드 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="alert-circle-outline" size={24} color={colors.danger} />
                <Text style={styles.cardTitle}>당뇨 위험도 평가</Text>
              </View>
              <Text style={styles.riskMessage}>{result.risk_message}</Text>
            </View>

            {/* 칼로리 정보 카드 */}
            {result.calorie_info && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="fire" size={24} color={colors.warning} />
                  <Text style={styles.cardTitle}>칼로리 정보</Text>
                </View>
                <View style={styles.calorieGrid}>
                  <View style={styles.calorieItem}>
                    <Text style={styles.calorieLabel}>중량</Text>
                    <Text style={styles.calorieValue}>
                      {result.calorie_info.grams} g
                    </Text>
                  </View>
                  <View style={styles.calorieItem}>
                    <Text style={styles.calorieLabel}>칼로리</Text>
                    <Text style={styles.calorieValue}>
                      {result.calorie_info.kcal} kcal
                    </Text>
                  </View>
                </View>
                {!result.calorie_info.scale_detected && (
                  <Text style={styles.calorieNote}>
                    * ArUco 마커가 감지되지 않아 추정값으로 계산되었습니다.
                  </Text>
                )}
              </View>
            )}

            {/* OCR 텍스트 카드 */}
            {result.ocr_texts && result.ocr_texts.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="text-recognition" size={24} color={colors.primary} />
                  <Text style={styles.cardTitle}>인식된 텍스트</Text>
                </View>
                <View style={styles.ocrContainer}>
                  {result.ocr_texts.slice(0, 8).map((text, index) => (
                    <View key={index} style={styles.ocrItem}>
                      <Icon
                        name="circle-small"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.ocrText}>{text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 영양 분석 카드 (음료인 경우) */}
            {result.nutrition_analysis && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="nutrition" size={24} color={colors.accent} />
                  <Text style={styles.cardTitle}>영양 성분 분석</Text>
                </View>
                <Text style={styles.nutritionText}>
                  {result.nutrition_analysis}
                </Text>
              </View>
            )}
          </>
        ) : (
          /* 음식이 감지되지 않은 경우 */
          <View style={[styles.card, styles.noDetectionCard]}>
            <Icon name="food-off" size={64} color={colors.textLight} />
            <Text style={styles.noDetectionTitle}>
              음식이 감지되지 않았습니다
            </Text>
            <Text style={styles.noDetectionText}>
              {result.message || '다시 촬영해주세요.'}
            </Text>
          </View>
        )}

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={handleRetake}>
            <Icon name="camera-retake" size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, styles.retakeButtonText]}>
              다시 촬영
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton]}
            onPress={handleHome}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.homeButtonGradient}>
              <Icon name="home" size={24} color="#FFF" />
              <Text style={styles.homeButtonText}>홈으로</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  foodCard: {
    padding: 0,
    overflow: 'hidden',
  },
  foodCardGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  foodType: {
    ...typography.h1,
    color: '#FFF',
    marginTop: spacing.md,
  },
  confidence: {
    ...typography.body1,
    color: '#FFF',
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  riskMessage: {
    ...typography.body1,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  calorieGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  calorieItem: {
    alignItems: 'center',
    flex: 1,
  },
  calorieLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  calorieValue: {
    ...typography.h2,
    color: colors.primary,
  },
  calorieNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  ocrContainer: {
    marginTop: spacing.sm,
  },
  ocrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ocrText: {
    ...typography.body2,
    color: colors.textPrimary,
    flex: 1,
  },
  nutritionText: {
    ...typography.body2,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  noDetectionCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  noDetectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noDetectionText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  retakeButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.body1,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  retakeButtonText: {
    color: colors.primary,
  },
  homeButton: {
    ...shadows.medium,
  },
  homeButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  homeButtonText: {
    ...typography.body1,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: spacing.xs,
  },
});

export default ResultScreen;
