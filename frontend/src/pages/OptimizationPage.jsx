import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  List,
  ListItem,
  Snackbar,
  IconButton,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import { callOptimizeApi, callUpdateListingApi } from '../services/optimizationService';

const KSA_MARKETPLACE_ID = "A1ZFF27R1HYPUL";

const OptimizationPage = () => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  // Product Input States
  const [asin, setAsin] = useState('');
  const [sellerSku, setSellerSku] = useState('');
  const [manualProductName, setManualProductName] = useState('');
  const [manualKeyFeatures, setManualKeyFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  // Optimization Config States
  const [language, setLanguage] = useState(i18n.language.startsWith('ar') ? 'ar' : 'en'); // Set initial based on i18n lang
  const [contentToOptimize, setContentToOptimize] = useState({
    title: true,
    bullet_points: true,
    description: true,
  });
  const [customKeywords, setCustomKeywords] = useState('');
  const [toneStyle, setToneStyle] = useState('ksa_default');

  // API Call State (for optimization)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optimizedData, setOptimizedData] = useState(null);

  // Edited Content States
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBulletPoints, setEditedBulletPoints] = useState([]);
  const [editedDescription, setEditedDescription] = useState('');

  // SP-API Update Listing State
  const [isUpdatingListing, setIsUpdatingListing] = useState(false);
  const [updateStatusMessage, setUpdateStatusMessage] = useState('');
  const [updateError, setUpdateError] = useState(false);

  // Snackbar state for copy feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Update component language state if i18n language changes
  useEffect(() => {
    setLanguage(i18n.language.startsWith('ar') ? 'ar' : 'en');
  }, [i18n.language]);

  useEffect(() => {
    if (optimizedData) {
      setEditedTitle(optimizedData.optimized_title || '');
      setEditedBulletPoints(optimizedData.optimized_bullet_points || []);
      setEditedDescription(optimizedData.optimized_description || '');
    } else {
      setEditedTitle('');
      setEditedBulletPoints([]);
      setEditedDescription('');
    }
  }, [optimizedData]);

  const handleContentToOptimizeChange = (event) => {
    setContentToOptimize({
      ...contentToOptimize,
      [event.target.name]: event.target.checked,
    });
  };

  const handleCopyToClipboard = async (textToCopy, labelKey) => {
    const label = t(labelKey);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setSnackbarMessage(t('copiedFeedback', { label }));
        setSnackbarOpen(true);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        setSnackbarMessage(t('copyFailedFeedback', { label }));
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage(t('copyApiNotAvailableFeedback'));
      setSnackbarOpen(true);
    }
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    setLoading(true);
    setError(null);
    setUpdateStatusMessage('');
    setUpdateError(false);

    const selectedContent = Object.keys(contentToOptimize).filter(key => contentToOptimize[key]);
    const keywordsArray = customKeywords.split(',').map(k => k.trim()).filter(k => k);

    const payload = {
      product_input: {
        asin: asin || null,
        manual_details: (manualProductName || manualKeyFeatures)
          ? { name: manualProductName, key_features: manualKeyFeatures.split(',').map(f => f.trim()).filter(f => f) }
          : null,
        target_audience: targetAudience || null,
      },
      optimization_config: {
        language: language, // Use component's language state
        content_to_optimize: selectedContent,
        custom_keywords: keywordsArray.length > 0 ? keywordsArray : null,
        tone_style: toneStyle || null,
      },
    };

    if (!payload.product_input.asin && !payload.product_input.manual_details?.name && !payload.product_input.manual_details?.key_features?.length) {
        setError(t('errorASINOrManual'));
        setLoading(false);
        return;
    }

    try {
      const response = await callOptimizeApi(payload);
      if (response && response.status === 'success' && response.data) {
        setOptimizedData(response.data);
        setError(null);
      } else if (response && response.status === 'error' && response.error_message) {
        setError(response.error_message);
        setOptimizedData(null);
      } else if (response && response.status !== 'success') {
        setError(response.error_message || "API returned a non-success status.");
        setOptimizedData(null);
      } else if (!response) {
        setError("Received no response or an invalid response from API.");
        setOptimizedData(null);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred while calling the API.");
      setOptimizedData(null);
      console.error("API Error caught in handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => { handleSubmit(); };

  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...editedBulletPoints];
    newBulletPoints[index] = value;
    setEditedBulletPoints(newBulletPoints);
  };

  const addBulletPoint = () => { setEditedBulletPoints([...editedBulletPoints, '']); };
  const removeBulletPoint = (index) => {
    setEditedBulletPoints(editedBulletPoints.filter((_, i) => i !== index));
  };

  const handleUpdateListing = async () => {
    if (!sellerSku) {
      setUpdateStatusMessage(t('errorSellerSKURequired'));
      setUpdateError(true);
      return;
    }
    if (!optimizedData) {
        setUpdateStatusMessage(t('errorNoOptimizedData'));
        setUpdateError(true);
        return;
    }

    setIsUpdatingListing(true);
    setUpdateStatusMessage('');
    setUpdateError(false);

    const updatePayload = {
      title: contentToOptimize.title ? editedTitle : undefined,
      bullet_points: contentToOptimize.bullet_points ? editedBulletPoints : undefined,
      description: contentToOptimize.description ? editedDescription : undefined,
    };

    let langTag = "en_US";
    if (language === "ar") langTag = "ar_AE";
    else if (language === "bilingual_ar_en") langTag = "ar_AE";

    try {
      const response = await callUpdateListingApi(sellerSku, KSA_MARKETPLACE_ID, updatePayload, langTag);
      if (response && (response.status.includes("SUCCESS") || response.status.includes("PENDING"))) {
        setUpdateStatusMessage(t('statusUpdateSubmitted', { status: response.status, submissionId: response.submission_id || 'N/A', message: response.message || '' }));
        setUpdateError(false);
      } else {
        setUpdateStatusMessage(t('statusUpdateFailed', { status: response.status, message: response.message || 'Unknown error.' }));
        setUpdateError(true);
      }
    } catch (err) {
      setUpdateStatusMessage(err.message || "An unexpected error occurred during update.");
      setUpdateError(true);
      console.error("Update API Error:", err);
    } finally {
      setIsUpdatingListing(false);
    }
  };

  return (
    <Container component={Paper} elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 2, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        {t('createOptimizationTitle')}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}><Typography variant="h6">{t('productInfoTitle')}</Typography></Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label={t('asinLabel')} helperText={t('asinHelper')} value={asin} onChange={(e) => setAsin(e.target.value)} variant="outlined"/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label={t('sellerSkuLabel')} value={sellerSku} onChange={(e) => setSellerSku(e.target.value)} variant="outlined" required />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center' }}><Typography color="textSecondary" variant="caption">{t('manualOr')}</Typography></Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label={t('manualProductNameLabel')} value={manualProductName} onChange={(e) => setManualProductName(e.target.value)} variant="outlined"/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label={t('manualKeyFeaturesLabel')} value={manualKeyFeatures} onChange={(e) => setManualKeyFeatures(e.target.value)} multiline rows={3} variant="outlined"/>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('targetAudienceLabel')} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} variant="outlined"/>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="h6">{t('optimizationConfigTitle')}</Typography></Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="language-select-label">{t('languageLabel')}</InputLabel>
              <Select labelId="language-select-label" value={language} onChange={(e) => setLanguage(e.target.value)} label={t('languageLabel')}>
                <MenuItem value="en">{t('english')}</MenuItem>
                <MenuItem value="ar">{t('arabic')}</MenuItem>
                <MenuItem value="bilingual_ar_en">{t('bilingual')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="tone-style-select-label">{t('toneStyleLabel')}</InputLabel>
              <Select labelId="tone-style-select-label" value={toneStyle} onChange={(e) => setToneStyle(e.target.value)} label={t('toneStyleLabel')}>
                <MenuItem value="ksa_default">{t('toneDefault')}</MenuItem>
                <MenuItem value="formal">{t('toneFormal')}</MenuItem>
                <MenuItem value="persuasive">{t('tonePersuasive')}</MenuItem>
                <MenuItem value="friendly">{t('toneFriendly')}</MenuItem>
                <MenuItem value="technical">{t('toneTechnical')}</MenuItem>
                <MenuItem value="luxury">{t('toneLuxury')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <Typography variant="subtitle1">{t('contentToOptimizeLabel')}</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel control={<Checkbox checked={contentToOptimize.title} onChange={handleContentToOptimizeChange} name="title"/>} label={t('optimizeTitle')}/>
                <FormControlLabel control={<Checkbox checked={contentToOptimize.bullet_points} onChange={handleContentToOptimizeChange} name="bullet_points"/>} label={t('optimizeBulletPoints')}/>
                <FormControlLabel control={<Checkbox checked={contentToOptimize.description} onChange={handleContentToOptimizeChange} name="description"/>} label={t('optimizeDescription')}/>
              </Stack>
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('customKeywordsLabel')} value={customKeywords} onChange={(e) => setCustomKeywords(e.target.value)} variant="outlined"/>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading} size="large" startIcon={loading ? <CircularProgress size={20} /> : null}>
              {loading ? t('optimizingButton') : t('optimizeButton')}
            </Button>
          </Grid>
          {error && (<Grid item xs={12}><Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{error}</Alert></Grid>)}
        </Grid>
      </Box>

      {optimizedData && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">{t('reviewEditTitle')}</Typography>
            <Button variant="outlined" color="secondary" startIcon={<RefreshIcon />} onClick={handleRegenerate} disabled={loading}>{t('regenerateButton')}</Button>
          </Stack>

          {contentToOptimize.title && editedTitle !== undefined && (
            <Box sx={{ mb: 3, p:2, border: '1px solid #ddd', borderRadius:1 }}>
              <Typography variant="h6" gutterBottom>{t('optimizeTitle')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField label={t('currentContentTitleLabel')} variant="outlined" fullWidth disabled multiline value={asin ? `Current title for ASIN ${asin}` : "N/A"} sx={{backgroundColor: 'grey.100'}}/></Grid>
                <Grid item xs={12} md={6}>
                  <TextField label={t('aiGeneratedTitleLabel')} variant="outlined" fullWidth multiline value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)}/>
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopyToClipboard(editedTitle, 'optimizeTitle')} sx={{mt:1}}>{t('copyEditedTitle')}</Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {contentToOptimize.bullet_points && editedBulletPoints !== undefined && (
            <Box sx={{ mb: 3, p:2, border: '1px solid #ddd', borderRadius:1 }}>
              <Typography variant="h6" gutterBottom>{t('optimizeBulletPoints')}</Typography>
              {editedBulletPoints.map((bullet, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1.5, alignItems: 'center' }}>
                  <Grid item xs={12} md={6}><TextField label={t('currentContentBulletLabel', { index: index + 1 })} variant="outlined" fullWidth disabled multiline value={"N/A"} sx={{backgroundColor: 'grey.100'}}/></Grid>
                  <Grid item xs={11} md={5}><TextField label={t('aiGeneratedBulletLabel', { index: index + 1 })} variant="outlined" fullWidth multiline value={bullet} onChange={(e) => handleBulletPointChange(index, e.target.value)}/>
                    <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopyToClipboard(bullet, `Bullet ${index + 1}`)} sx={{mt:0.5}}>{t('copyButton')}</Button>
                  </Grid>
                  <Grid item xs={1} md={1} sx={{textAlign:'center'}}><IconButton onClick={() => removeBulletPoint(index)} color="error" title={t('removeBulletButtonTitle')}><RemoveCircleOutlineIcon /></IconButton></Grid>
                </Grid>
              ))}
              <Button startIcon={<AddCircleOutlineIcon />} onClick={addBulletPoint} variant="outlined" size="small" sx={{ mr: 1, mt:1 }}>{t('addBulletButton')}</Button>
              {editedBulletPoints.length > 0 && <Button size="small" variant="outlined" color="secondary" startIcon={<ContentCopyIcon />} onClick={() => handleCopyToClipboard(editedBulletPoints.join('\n'), 'All Bullets')} sx={{ mt:1 }}>{t('copyAllEditedBulletsButton')}</Button>}
            </Box>
          )}

          {contentToOptimize.description && editedDescription !== undefined && (
            <Box sx={{ p:2, border: '1px solid #ddd', borderRadius:1, mb:3 }}>
              <Typography variant="h6" gutterBottom>{t('optimizeDescription')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField label={t('currentContentDescriptionLabel')} variant="outlined" fullWidth disabled multiline rows={5} value={asin ? `Current desc for ASIN ${asin}` : "N/A"} sx={{backgroundColor: 'grey.100'}}/></Grid>
                <Grid item xs={12} md={6}>
                  <TextField label={t('aiGeneratedDescriptionLabel')} variant="outlined" fullWidth multiline rows={5} value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)}/>
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => handleCopyToClipboard(editedDescription, 'optimizeDescription')} sx={{mt:1}}>{t('copyEditedDescription')}</Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center', mt: 2, p:2, border: '1px dashed #ccc', borderRadius:1 }}>
            <Typography variant="h6" gutterBottom>{t('updateToAmazonTitle')}</Typography>
            <Typography variant="caption" display="block" color="textSecondary" sx={{mb:1}}>
                {t('updateToAmazonInstruction')}
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={isUpdatingListing ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleUpdateListing}
              disabled={!sellerSku || isUpdatingListing || !optimizedData}
              size="large"
            >
              {isUpdatingListing ? t('updatingOnAmazonButton') : t('updateOnAmazonButton')}
            </Button>
            {updateStatusMessage && (
              <Alert severity={updateError ? "error" : "success"} sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {updateStatusMessage}
              </Alert>
            )}
          </Box>
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}/>
    </Container>
  );
};

export default OptimizationPage;
